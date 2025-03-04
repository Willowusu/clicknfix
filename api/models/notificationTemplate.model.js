const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'booking_created',
            'booking_assigned',
            'booking_completed',
            'booking_cancelled',
            'payment_received',
            'payment_failed',
            'chat_message',
            'rating_reminder',
            'subscription_expiring',
            'account_alert'
        ]
    },
    channel: {
        type: String,
        required: true,
        enum: ['email', 'sms', 'push', 'in_app']
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    variables: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        lastUsed: Date,
        useCount: {
            type: Number,
            default: 0
        },
        version: {
            type: Number,
            default: 1
        }
    },
    settings: {
        priority: {
            type: String,
            enum: ['low', 'normal', 'high'],
            default: 'normal'
        },
        delaySeconds: {
            type: Number,
            default: 0
        },
        retryCount: {
            type: Number,
            default: 3
        }
    }
}, {
    timestamps: true
});

// Compound index for type and channel uniqueness
notificationTemplateSchema.index({ type: 1, channel: 1 }, { unique: true });

// Method to increment use count
notificationTemplateSchema.methods.incrementUseCount = async function() {
    this.metadata.lastUsed = new Date();
    this.metadata.useCount += 1;
    await this.save();
};

// Method to compile template with variables
notificationTemplateSchema.methods.compile = function(variables) {
    let compiledContent = this.content;
    for (const [key, value] of Object.entries(variables)) {
        compiledContent = compiledContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return compiledContent;
};

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema); 