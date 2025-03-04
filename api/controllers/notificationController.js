const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

// Create notification
exports.createNotification = async (req, res) => {
    try {
        const {
            recipient,
            type,
            title,
            message,
            priority,
            data,
            deliveryChannels,
            scheduledFor,
            expiresAt
        } = req.body;

        // Validate required fields
        if (!recipient || !type || !title || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const notification = new Notification({
            recipient,
            type,
            title,
            message,
            priority,
            data,
            deliveryChannels: deliveryChannels || [{ type: 'in_app' }],
            scheduledFor,
            expiresAt
        });

        await notification.save();

        // If notification is scheduled for future, return here
        if (scheduledFor && new Date(scheduledFor) > new Date()) {
            return res.status(201).json({
                message: "Notification scheduled successfully",
                notification
            });
        }

        // Process immediate delivery channels
        await processDeliveryChannels(notification);

        return res.status(201).json({
            message: "Notification created successfully",
            notification
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, type, page = 1, limit = 20 } = req.query;

        const query = {
            recipient: userId,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        };

        if (status) query.status = status;
        if (type) query.type = type;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);

        return res.status(200).json({
            notifications,
            pagination: {
                current: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error retrieving notifications:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findOne({
            _id: id,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.markAsRead();

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type } = req.query;

        const query = {
            recipient: userId,
            status: 'unread'
        };

        if (type) query.type = type;

        await Notification.updateMany(query, {
            $set: { status: 'read' }
        });

        return res.status(200).json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        // This would typically come from a user preferences collection
        // For now, returning default preferences
        return res.status(200).json({
            preferences: {
                email: true,
                push: true,
                sms: false,
                types: {
                    booking_created: ['email', 'push'],
                    booking_confirmed: ['email', 'push', 'sms'],
                    payment_received: ['email'],
                    chat_message: ['push']
                }
            }
        });
    } catch (error) {
        console.error("Error getting notification preferences:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        const preferences = req.body;

        // This would typically update a user preferences collection
        // For now, just returning success
        return res.status(200).json({
            message: "Preferences updated successfully",
            preferences
        });
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Helper function to process delivery channels
async function processDeliveryChannels(notification) {
    for (const channel of notification.deliveryChannels) {
        try {
            switch (channel.type) {
                case 'email':
                    // Implement email sending logic
                    // await sendEmail(notification);
                    channel.status = 'sent';
                    break;
                case 'sms':
                    // Implement SMS sending logic
                    // await sendSMS(notification);
                    channel.status = 'sent';
                    break;
                case 'push':
                    // Implement push notification logic
                    // await sendPushNotification(notification);
                    channel.status = 'sent';
                    break;
                case 'in_app':
                    // In-app notifications don't need additional processing
                    channel.status = 'sent';
                    break;
            }
            channel.sentAt = new Date();
        } catch (error) {
            console.error(`Error processing ${channel.type} notification:`, error);
            channel.status = 'failed';
            channel.error = error.message;
        }
    }

    await notification.save();
}

module.exports = exports; 