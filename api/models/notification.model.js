const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'booking_created',
            'booking_confirmed',
            'booking_canceled',
            'booking_completed',
            'payment_received',
            'payment_failed',
            'service_reminder',
            'document_expiring',
            'rating_reminder',
            'chat_message',
            'system_alert'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'archived'],
        default: 'unread'
    },
    data: {
        booking: {
            type: Schema.Types.ObjectId,
            ref: 'Booking'
        },
        payment: {
            type: Schema.Types.ObjectId,
            ref: 'Payment'
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        },
        url: String,
        actionRequired: Boolean,
        actionType: String,
        actionDeadline: Date
    },
    deliveryChannels: [{
        type: {
            type: String,
            enum: ['in_app', 'email', 'sms', 'push'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending'
        },
        sentAt: Date,
        error: String
    }],
    scheduledFor: Date,
    expiresAt: Date,
    metadata: {
        deviceInfo: String,
        location: String,
        userAgent: String
    }
}, {
    timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ type: 1, scheduledFor: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function () {
    this.status = 'read';
    return this.save();
};

// Method to schedule notification
notificationSchema.methods.schedule = function (scheduledDate) {
    this.scheduledFor = scheduledDate;
    return this.save();
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadForUser = function (userId) {
    return this.find({
        recipient: userId,
        status: 'unread',
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    }).sort({ createdAt: -1 });
};

// Middleware to handle notification expiry
notificationSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'read') {
        this.deliveryChannels.forEach(channel => {
            if (channel.status === 'pending') {
                channel.status = 'sent';
                channel.sentAt = new Date();
            }
        });
    }
    next();
});

module.exports = mongoose.model('Notification', notificationSchema); 