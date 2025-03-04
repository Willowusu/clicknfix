const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PricingRuleSchema = new Schema({
    type: {
        type: String,
        enum: ['peak_hours', 'location_based', 'demand_based', 'special_event'],
        required: true
    },
    multiplier: {
        type: Number,
        required: true,
        min: 0
    },
    conditions: {
        timeRange: {
            start: String, // HH:mm format
            end: String    // HH:mm format
        },
        daysOfWeek: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        location: {
            regions: [String],
            multiplierByRegion: Map
        },
        demandThreshold: Number,
        eventName: String,
        eventDates: {
            start: Date,
            end: Date
        }
    },
    active: {
        type: Boolean,
        default: true
    }
});

const ServiceRequirementSchema = new Schema({
    type: {
        type: String,
        enum: ['tool', 'qualification', 'prerequisite_service', 'documentation'],
        required: true
    },
    description: String,
    mandatory: {
        type: Boolean,
        default: true
    },
    validationMethod: {
        type: String,
        enum: ['automatic', 'manual', 'none'],
        default: 'manual'
    }
});

const serviceSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: String,
    basePrice: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: v => v ? parseFloat(v.toString()) : null
    },
    pricingModel: {
        type: String,
        enum: ['fixed', 'hourly', 'quote_based'],
        default: 'fixed'
    },
    dynamicPricing: {
        enabled: {
            type: Boolean,
            default: false
        },
        rules: [PricingRuleSchema]
    },
    duration: {
        estimated: {
            type: Number,
            required: true,
            min: 1
        }, // in minutes
        variance: {
            type: Number,
            default: 0
        } // additional buffer time in minutes
    },
    availability: {
        schedule: [{
            dayOfWeek: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            timeSlots: [{
                start: String, // HH:mm format
                end: String,   // HH:mm format
                maxBookings: Number
            }]
        }],
        exceptions: [{
            date: Date,
            available: Boolean,
            reason: String
        }]
    },
    requirements: [ServiceRequirementSchema],
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'expert'],
            default: 'intermediate'
        }
    }],
    equipment: [{
        name: String,
        description: String,
        providedBy: {
            type: String,
            enum: ['service_provider', 'client'],
            required: true
        }
    }],
    cancellationPolicy: {
        deadline: {
            type: Number,
            default: 24
        }, // hours before service
        fee: {
            type: mongoose.Schema.Types.Decimal128,
            get: v => v ? parseFloat(v.toString()) : null
        }
    },
    ratings: {
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
    media: [{
        type: {
            type: String,
            enum: ['image', 'video', 'document'],
            required: true
        },
        url: String,
        description: String
    }],
    isPackage: {
        type: Boolean,
        default: false
    },
    packageServices: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        },
        quantity: {
            type: Number,
            default: 1
        },
        discount: {
            type: Number,
            default: 0
        } // percentage
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

// Indexes for better query performance
serviceSchema.index({ provider: 1, status: 1 });
serviceSchema.index({ category: 1, subcategory: 1 });
serviceSchema.index({ 'ratings.average': -1 });
serviceSchema.index({ basePrice: 1 });

// Virtual for calculating final price with dynamic pricing
serviceSchema.methods.calculatePrice = function (date, location) {
    let finalPrice = this.basePrice;

    if (this.dynamicPricing.enabled) {
        for (const rule of this.dynamicPricing.rules) {
            if (!rule.active) continue;

            // Apply relevant pricing rules based on time, location, etc.
            if (this._matchPricingRule(rule, date, location)) {
                finalPrice *= rule.multiplier;
            }
        }
    }

    return finalPrice;
};

// Helper method to match pricing rules
serviceSchema.methods._matchPricingRule = function (rule, date, location) {
    if (!date) return false;

    switch (rule.type) {
        case 'peak_hours':
            return this._isPeakHour(date, rule.conditions.timeRange);
        case 'location_based':
            return location && rule.conditions.regions.includes(location);
        case 'special_event':
            return date >= rule.conditions.eventDates.start &&
                date <= rule.conditions.eventDates.end;
        default:
            return false;
    }
};

// Helper method to check peak hours
serviceSchema.methods._isPeakHour = function (date, timeRange) {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return time >= timeRange.start && time <= timeRange.end;
};

module.exports = mongoose.model('Service', serviceSchema)