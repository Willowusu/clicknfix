const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MetricSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    unit: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const RevenueMetricsSchema = new Schema({
    totalRevenue: {
        type: mongoose.Schema.Types.Decimal128,
        get: v => v ? parseFloat(v.toString()) : 0
    },
    platformFees: {
        type: mongoose.Schema.Types.Decimal128,
        get: v => v ? parseFloat(v.toString()) : 0
    },
    providerEarnings: {
        type: mongoose.Schema.Types.Decimal128,
        get: v => v ? parseFloat(v.toString()) : 0
    },
    refunds: {
        type: mongoose.Schema.Types.Decimal128,
        get: v => v ? parseFloat(v.toString()) : 0
    },
    averageOrderValue: {
        type: mongoose.Schema.Types.Decimal128,
        get: v => v ? parseFloat(v.toString()) : 0
    }
});

const BookingMetricsSchema = new Schema({
    totalBookings: Number,
    completedBookings: Number,
    canceledBookings: Number,
    averageCompletionTime: Number, // in minutes
    satisfactionScore: {
        type: Number,
        min: 0,
        max: 100
    }
});

const UserMetricsSchema = new Schema({
    totalUsers: Number,
    activeUsers: Number,
    newUsers: Number,
    churnRate: Number,
    userRetentionRate: Number
});

const analyticsSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    timeframe: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    revenue: RevenueMetricsSchema,
    bookings: BookingMetricsSchema,
    users: UserMetricsSchema,
    serviceMetrics: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        },
        bookings: Number,
        revenue: mongoose.Schema.Types.Decimal128,
        rating: Number
    }],
    locationMetrics: [{
        location: String,
        bookings: Number,
        revenue: mongoose.Schema.Types.Decimal128
    }],
    servicemanMetrics: [{
        serviceman: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceMan'
        },
        bookings: Number,
        revenue: mongoose.Schema.Types.Decimal128,
        rating: Number,
        completionRate: Number
    }],
    customMetrics: [MetricSchema],
    trends: {
        growthRate: Number,
        popularServices: [{
            service: {
                type: Schema.Types.ObjectId,
                ref: 'Service'
            },
            bookings: Number,
            trend: Number // percentage change
        }],
        peakHours: [{
            hour: Number,
            bookings: Number
        }],
        customerSegments: [{
            segment: String,
            count: Number,
            revenue: mongoose.Schema.Types.Decimal128
        }]
    }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

// Indexes for better query performance
analyticsSchema.index({ provider: 1, timeframe: 1, date: 1 });
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'serviceMetrics.service': 1 });
analyticsSchema.index({ 'servicemanMetrics.serviceman': 1 });

// Method to calculate growth rates
analyticsSchema.methods.calculateGrowth = function (previousPeriod) {
    if (!previousPeriod) return null;

    const growth = {
        revenue: this._calculateGrowthRate(
            this.revenue.totalRevenue,
            previousPeriod.revenue.totalRevenue
        ),
        bookings: this._calculateGrowthRate(
            this.bookings.totalBookings,
            previousPeriod.bookings.totalBookings
        ),
        users: this._calculateGrowthRate(
            this.users.totalUsers,
            previousPeriod.users.totalUsers
        )
    };

    return growth;
};

// Helper method to calculate growth rate
analyticsSchema.methods._calculateGrowthRate = function (current, previous) {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
};

// Static method to generate period report
analyticsSchema.statics.generatePeriodReport = async function (provider, timeframe, startDate, endDate) {
    const report = await this.aggregate([
        {
            $match: {
                provider: mongoose.Types.ObjectId(provider),
                timeframe,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$revenue.totalRevenue' },
                totalBookings: { $sum: '$bookings.totalBookings' },
                averageRating: { $avg: '$bookings.satisfactionScore' },
                serviceMetrics: { $push: '$serviceMetrics' },
                locationMetrics: { $push: '$locationMetrics' }
            }
        }
    ]);

    return report[0];
};

// Method to update metrics
analyticsSchema.methods.updateMetrics = async function (newData) {
    Object.assign(this, newData);
    return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema); 