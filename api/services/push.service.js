require('dotenv').config()
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    });
}

class PushNotificationService {
    static async sendNotification(tokens, notification) {
        try {
            if (!tokens || tokens.length === 0) {
                throw new Error('No FCM tokens provided');
            }

            const message = {
                notification: {
                    title: notification.title,
                    body: notification.message
                },
                data: {
                    type: notification.type,
                    ...notification.data
                },
                tokens: Array.isArray(tokens) ? tokens : [tokens]
            };

            const response = await admin.messaging().sendMulticast(message);

            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });
                console.error('Failed to send to tokens:', failedTokens);
            }

            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
            console.error('Push notification error:', error);
            throw error;
        }
    }

    static async sendBookingUpdate(booking, user) {
        try {
            if (!user.fcmTokens || user.fcmTokens.length === 0) {
                throw new Error('User has no FCM tokens');
            }

            const message = {
                notification: {
                    title: 'Booking Update',
                    body: `Your booking #${booking._id} status has been updated to ${booking.status}`
                },
                data: {
                    type: 'booking_update',
                    bookingId: booking._id.toString(),
                    status: booking.status
                },
                tokens: user.fcmTokens
            };

            const response = await admin.messaging().sendMulticast(message);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
            console.error('Push notification error:', error);
            throw error;
        }
    }

    static async sendChatMessage(chat, message, recipients) {
        try {
            const tokens = recipients
                .filter(user => user.fcmTokens && user.fcmTokens.length > 0)
                .flatMap(user => user.fcmTokens);

            if (tokens.length === 0) {
                throw new Error('No recipients have FCM tokens');
            }

            const notification = {
                notification: {
                    title: `New message in ${chat.type}`,
                    body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
                },
                data: {
                    type: 'chat_message',
                    chatId: chat._id.toString(),
                    messageId: message._id.toString()
                },
                tokens
            };

            const response = await admin.messaging().sendMulticast(notification);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
            console.error('Push notification error:', error);
            throw error;
        }
    }
}

module.exports = PushNotificationService; 