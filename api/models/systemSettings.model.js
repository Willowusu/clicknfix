const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    booking: {
        autoAssignmentEnabled: {
            type: Boolean,
            default: true
        },
        maxActiveBookingsPerServiceman: {
            type: Number,
            default: 5
        },
        defaultBookingExpiryHours: {
            type: Number,
            default: 24
        },
        cancellationWindowHours: {
            type: Number,
            default: 2
        },
        autoRejectTimeMinutes: {
            type: Number,
            default: 30
        },
        allowedPaymentMethods: {
            type: [String],
            default: ['card', 'cash']
        }
    },
    notification: {
        emailEnabled: {
            type: Boolean,
            default: true
        },
        smsEnabled: {
            type: Boolean,
            default: true
        },
        pushEnabled: {
            type: Boolean,
            default: true
        },
        reminderIntervals: {
            type: [Number],
            default: [24, 2] // hours before booking
        },
        maxRetries: {
            type: Number,
            default: 3
        }
    },
    payment: {
        currencies: {
            type: [String],
            default: ['USD', 'EUR', 'GBP']
        },
        defaultCurrency: {
            type: String,
            default: 'USD'
        },
        platformFeePercentage: {
            type: Number,
            default: 10
        },
        minimumPayout: {
            type: Number,
            default: 50
        },
        payoutSchedule: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly'],
            default: 'weekly'
        }
    },
    security: {
        passwordMinLength: {
            type: Number,
            default: 8
        },
        passwordRequiresSpecialChar: {
            type: Boolean,
            default: true
        },
        sessionTimeoutMinutes: {
            type: Number,
            default: 60
        },
        maxLoginAttempts: {
            type: Number,
            default: 5
        },
        jwtExpirationHours: {
            type: Number,
            default: 24
        }
    },
    maintenance: {
        isMaintenanceMode: {
            type: Boolean,
            default: false
        },
        maintenanceMessage: {
            type: String,
            default: 'System is under maintenance. Please try again later.'
        },
        allowedIPs: {
            type: [String],
            default: []
        }
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await this.constructor.countDocuments();
        if (count > 0) {
            throw new Error('Only one settings document can exist');
        }
    }
    next();
});

// Static method to get settings
systemSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema); 