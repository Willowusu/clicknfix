const Analytics = require('../models/analytics.model');
const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const ServiceMan = require('../models/serviceman.model');
const mongoose = require('mongoose');

// Generate or update analytics
exports.generateAnalytics = async (req, res) => {
    try {
        const { provider, timeframe, date } = req.body;

        if (!provider || !timeframe || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Calculate date range based on timeframe
        const startDate = new Date(date);
        let endDate = new Date(date);

        switch (timeframe) {
            case 'daily':
                endDate.setDate(endDate.getDate() + 1);
                break;
            case 'weekly':
                endDate.setDate(endDate.getDate() + 7);
                break;
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }

        // Gather metrics
        const [bookingMetrics, serviceMetrics, servicemanMetrics] = await Promise.all([
            calculateBookingMetrics(provider, startDate, endDate),
            calculateServiceMetrics(provider, startDate, endDate),
            calculateServicemanMetrics(provider, startDate, endDate)
        ]);

        // Create or update analytics
        const analytics = await Analytics.findOneAndUpdate(
            {
                provider,
                timeframe,
                date: startDate
            },
            {
                provider,
                timeframe,
                date: startDate,
                revenue: bookingMetrics.revenue,
                bookings: bookingMetrics.bookings,
                users: bookingMetrics.users,
                serviceMetrics,
                servicemanMetrics,
                trends: {
                    growthRate: await calculateGrowthRate(provider, timeframe, startDate),
                    popularServices: serviceMetrics.slice(0, 5),
                    peakHours: bookingMetrics.peakHours,
                    customerSegments: bookingMetrics.customerSegments
                }
            },
            { new: true, upsert: true }
        );

        return res.status(200).json(analytics);
    } catch (error) {
        console.error("Error generating analytics:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get analytics report
exports.getAnalytics = async (req, res) => {
    try {
        const { provider, timeframe, startDate, endDate } = req.query;

        if (!provider || !timeframe || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const report = await Analytics.generatePeriodReport(
            provider,
            timeframe,
            new Date(startDate),
            new Date(endDate)
        );

        return res.status(200).json(report);
    } catch (error) {
        console.error("Error retrieving analytics:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get revenue insights
exports.getRevenueInsights = async (req, res) => {
    try {
        const { provider, startDate, endDate } = req.query;

        const insights = await Analytics.aggregate([
            {
                $match: {
                    provider: mongoose.Types.ObjectId(provider),
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$revenue.totalRevenue' },
                    totalPlatformFees: { $sum: '$revenue.platformFees' },
                    totalProviderEarnings: { $sum: '$revenue.providerEarnings' },
                    totalRefunds: { $sum: '$revenue.refunds' },
                    averageOrderValue: { $avg: '$revenue.averageOrderValue' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalPlatformFees: 1,
                    totalProviderEarnings: 1,
                    totalRefunds: 1,
                    averageOrderValue: 1,
                    netRevenue: {
                        $subtract: ['$totalRevenue', '$totalRefunds']
                    },
                    profitMargin: {
                        $multiply: [
                            {
                                $divide: [
                                    { $subtract: ['$totalRevenue', '$totalRefunds'] },
                                    '$totalRevenue'
                                ]
                            },
                            100
                        ]
                    }
                }
            }
        ]);

        return res.status(200).json(insights[0] || {
            totalRevenue: 0,
            totalPlatformFees: 0,
            totalProviderEarnings: 0,
            totalRefunds: 0,
            averageOrderValue: 0,
            netRevenue: 0,
            profitMargin: 0
        });
    } catch (error) {
        console.error("Error getting revenue insights:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get performance metrics
exports.getPerformanceMetrics = async (req, res) => {
    try {
        const { provider, startDate, endDate } = req.query;

        const metrics = await Analytics.aggregate([
            {
                $match: {
                    provider: mongoose.Types.ObjectId(provider),
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: '$bookings.totalBookings' },
                    completedBookings: { $sum: '$bookings.completedBookings' },
                    canceledBookings: { $sum: '$bookings.canceledBookings' },
                    averageCompletionTime: { $avg: '$bookings.averageCompletionTime' },
                    averageSatisfactionScore: { $avg: '$bookings.satisfactionScore' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBookings: 1,
                    completedBookings: 1,
                    canceledBookings: 1,
                    averageCompletionTime: 1,
                    averageSatisfactionScore: 1,
                    completionRate: {
                        $multiply: [
                            {
                                $divide: ['$completedBookings', '$totalBookings']
                            },
                            100
                        ]
                    },
                    cancellationRate: {
                        $multiply: [
                            {
                                $divide: ['$canceledBookings', '$totalBookings']
                            },
                            100
                        ]
                    }
                }
            }
        ]);

        return res.status(200).json(metrics[0] || {
            totalBookings: 0,
            completedBookings: 0,
            canceledBookings: 0,
            averageCompletionTime: 0,
            averageSatisfactionScore: 0,
            completionRate: 0,
            cancellationRate: 0
        });
    } catch (error) {
        console.error("Error getting performance metrics:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Helper functions
async function calculateBookingMetrics(provider, startDate, endDate) {
    const bookings = await Booking.aggregate([
        {
            $match: {
                provider: mongoose.Types.ObjectId(provider),
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                completedBookings: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                },
                canceledBookings: {
                    $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] }
                },
                totalRevenue: { $sum: "$payment.amount" },
                averageCompletionTime: { $avg: "$schedule.actualDuration" },
                satisfactionScore: { $avg: "$quality.satisfactionScore" },
                uniqueCustomers: { $addToSet: "$customer" },
                peakHours: {
                    $push: {
                        $hour: "$schedule.requestedDate"
                    }
                }
            }
        }
    ]);

    const metrics = bookings[0] || {
        totalBookings: 0,
        completedBookings: 0,
        canceledBookings: 0,
        totalRevenue: 0,
        averageCompletionTime: 0,
        satisfactionScore: 0,
        uniqueCustomers: [],
        peakHours: []
    };

    // Calculate peak hours
    const hourCounts = {};
    metrics.peakHours.forEach(hour => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return {
        bookings: {
            totalBookings: metrics.totalBookings,
            completedBookings: metrics.completedBookings,
            canceledBookings: metrics.canceledBookings,
            averageCompletionTime: metrics.averageCompletionTime,
            satisfactionScore: metrics.satisfactionScore
        },
        revenue: {
            totalRevenue: metrics.totalRevenue,
            platformFees: metrics.totalRevenue * 0.1, // Example platform fee calculation
            providerEarnings: metrics.totalRevenue * 0.9
        },
        users: {
            totalUsers: metrics.uniqueCustomers.length,
            // Add more user metrics as needed
        },
        peakHours: Object.entries(hourCounts).map(([hour, count]) => ({
            hour: parseInt(hour),
            bookings: count
        })).sort((a, b) => b.bookings - a.bookings)
    };
}

async function calculateServiceMetrics(provider, startDate, endDate) {
    return Service.aggregate([
        {
            $match: {
                provider: mongoose.Types.ObjectId(provider)
            }
        },
        {
            $lookup: {
                from: 'bookings',
                localField: '_id',
                foreignField: 'service',
                as: 'bookings'
            }
        },
        {
            $project: {
                service: '$_id',
                bookings: {
                    $size: {
                        $filter: {
                            input: '$bookings',
                            as: 'booking',
                            cond: {
                                $and: [
                                    { $gte: ['$$booking.createdAt', startDate] },
                                    { $lt: ['$$booking.createdAt', endDate] }
                                ]
                            }
                        }
                    }
                },
                revenue: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: '$bookings',
                                    as: 'booking',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$booking.createdAt', startDate] },
                                            { $lt: ['$$booking.createdAt', endDate] }
                                        ]
                                    }
                                }
                            },
                            as: 'booking',
                            in: '$$booking.payment.amount'
                        }
                    }
                },
                rating: { $avg: '$ratings.average' }
            }
        },
        {
            $sort: { bookings: -1 }
        }
    ]);
}

async function calculateServicemanMetrics(provider, startDate, endDate) {
    return ServiceMan.aggregate([
        {
            $match: {
                provider: mongoose.Types.ObjectId(provider)
            }
        },
        {
            $lookup: {
                from: 'bookings',
                localField: '_id',
                foreignField: 'serviceman.assigned',
                as: 'bookings'
            }
        },
        {
            $project: {
                serviceman: '$_id',
                bookings: {
                    $size: {
                        $filter: {
                            input: '$bookings',
                            as: 'booking',
                            cond: {
                                $and: [
                                    { $gte: ['$$booking.createdAt', startDate] },
                                    { $lt: ['$$booking.createdAt', endDate] }
                                ]
                            }
                        }
                    }
                },
                revenue: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: '$bookings',
                                    as: 'booking',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$booking.createdAt', startDate] },
                                            { $lt: ['$$booking.createdAt', endDate] }
                                        ]
                                    }
                                }
                            },
                            as: 'booking',
                            in: '$$booking.payment.amount'
                        }
                    }
                },
                rating: { $avg: '$performance.rating.average' },
                completionRate: '$performance.completionRate'
            }
        },
        {
            $sort: { bookings: -1 }
        }
    ]);
}

async function calculateGrowthRate(provider, timeframe, currentDate) {
    const previousDate = new Date(currentDate);

    switch (timeframe) {
        case 'daily':
            previousDate.setDate(previousDate.getDate() - 1);
            break;
        case 'weekly':
            previousDate.setDate(previousDate.getDate() - 7);
            break;
        case 'monthly':
            previousDate.setMonth(previousDate.getMonth() - 1);
            break;
        case 'yearly':
            previousDate.setFullYear(previousDate.getFullYear() - 1);
            break;
    }

    const [current, previous] = await Promise.all([
        Analytics.findOne({ provider, timeframe, date: currentDate }),
        Analytics.findOne({ provider, timeframe, date: previousDate })
    ]);

    if (!current || !previous) return 0;

    return ((current.revenue.totalRevenue - previous.revenue.totalRevenue) / previous.revenue.totalRevenue) * 100;
}

module.exports = exports; 