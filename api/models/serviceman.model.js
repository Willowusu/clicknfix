const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    timeSlots: [{
        start: String, // HH:mm format
        end: String,   // HH:mm format
        available: {
            type: Boolean,
            default: true
        }
    }]
});

const CertificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    issuingAuthority: String,
    certificationNumber: String,
    issueDate: Date,
    expiryDate: Date,
    status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'active'
    },
    documents: [{
        type: String,
        url: String,
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        }
    }]
});

const PerformanceMetricsSchema = new mongoose.Schema({
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    completionRate: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    punctualityScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    customerFeedback: [{
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    qualityIssues: [{
        issue: String,
        date: Date,
        resolution: String,
        status: {
            type: String,
            enum: ['open', 'resolved', 'escalated'],
            default: 'open'
        }
    }]
});

const servicemanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    skills: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'expert'],
            default: 'beginner'
        },
        yearsOfExperience: Number,
        certified: Boolean
    }],
    certifications: [CertificationSchema],
    status: {
        type: String,
        enum: ["available", "busy", "offline", "on_leave", "inactive"],
        default: "available"
    },
    location: {
        address: String,
        city: { type: String },
        state: { type: String },
        country: { type: String },
        coordinates: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], index: "2dsphere", required: true }
        }
    },
    availability: {
        regularSchedule: [AvailabilitySchema],
        exceptions: [{
            date: Date,
            available: Boolean,
            reason: String
        }],
        preferences: {
            maxBookingsPerDay: {
                type: Number,
                default: 8
            },
            breakBetweenBookings: {
                type: Number,
                default: 30
            }, // minutes
            maxTravelDistance: {
                type: Number,
                default: 50
            } // kilometers
        }
    },
    workload: {
        currentBookings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        }],
        completedBookings: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: mongoose.Schema.Types.Decimal128,
            default: 0,
            get: v => v ? parseFloat(v.toString()) : 0
        }
    },
    performance: PerformanceMetricsSchema,
    equipment: [{
        name: String,
        status: {
            type: String,
            enum: ['available', 'in_use', 'maintenance', 'lost'],
            default: 'available'
        },
        lastMaintenance: Date,
        nextMaintenance: Date
    }],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    documents: [{
        type: {
            type: String,
            enum: ['id', 'license', 'insurance', 'background_check', 'other'],
            required: true
        },
        number: String,
        expiryDate: Date,
        status: {
            type: String,
            enum: ['pending', 'verified', 'expired'],
            default: 'pending'
        },
        url: String
    }]
}, {
    timestamps: true,
    toJSON: { getters: true }
});

// Indexes for better query performance
servicemanSchema.index({ provider: 1, status: 1 });
servicemanSchema.index({ 'location.coordinates': '2dsphere' });
servicemanSchema.index({ 'performance.rating.average': -1 });
servicemanSchema.index({ 'skills.service': 1 });

// Virtual for calculating current workload percentage
servicemanSchema.virtual('workloadPercentage').get(function () {
    const maxBookings = this.availability.preferences.maxBookingsPerDay;
    return (this.workload.currentBookings.length / maxBookings) * 100;
});

// Method to check if serviceman is available for a specific time slot
servicemanSchema.methods.isAvailableFor = function (startTime, endTime) {
    // Convert times to Date objects if they're not already
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);

    // Check if the date falls on an exception day
    const exceptionDay = this.availability.exceptions.find(exc =>
        exc.date.toDateString() === start.toDateString()
    );
    if (exceptionDay) return exceptionDay.available;

    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[start.getDay()];

    // Find regular schedule for this day
    const schedule = this.availability.regularSchedule.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule) return false;

    // Check if the time falls within any available time slot
    const timeStr = start.toTimeString().slice(0, 5); // HH:mm format
    return schedule.timeSlots.some(slot =>
        slot.available && timeStr >= slot.start && timeStr <= slot.end
    );
};

// Method to update performance metrics
servicemanSchema.methods.updatePerformance = function (bookingData) {
    const performance = this.performance;

    if (bookingData.rating) {
        const oldTotal = performance.rating.average * performance.rating.count;
        performance.rating.count += 1;
        performance.rating.average = (oldTotal + bookingData.rating) / performance.rating.count;
    }

    if (bookingData.completedOnTime) {
        this.performance.punctualityScore =
            (this.performance.punctualityScore * 0.9) + (100 * 0.1);
    } else {
        this.performance.punctualityScore =
            (this.performance.punctualityScore * 0.9) + (0 * 0.1);
    }

    return this.save();
};

module.exports = mongoose.model("ServiceMan", servicemanSchema);
