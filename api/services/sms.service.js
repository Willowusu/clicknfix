require('dotenv').config()
const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

class SMSService {
    static async sendNotification(phoneNumber, message) {
        try {
            const response = await client.messages.create({
                body: message,
                to: phoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER
            });

            return {
                success: true,
                messageId: response.sid
            };
        } catch (error) {
            console.error('SMS sending error:', error);
            throw error;
        }
    }

    static async sendBookingReminder(booking) {
        try {
            const message = `Reminder: Your booking #${booking._id} is scheduled for ${booking.schedule.requestedDate}. View details: ${process.env.FRONTEND_URL}/bookings/${booking._id}`;

            const response = await client.messages.create({
                body: message,
                to: booking.customer.phone,
                from: process.env.TWILIO_PHONE_NUMBER
            });

            return {
                success: true,
                messageId: response.sid
            };
        } catch (error) {
            console.error('SMS sending error:', error);
            throw error;
        }
    }

    static async sendServicemanAlert(booking, serviceman) {
        try {
            const message = `New booking assignment #${booking._id}. Customer: ${booking.customer.name}. Location: ${booking.location.address}. Accept: ${process.env.FRONTEND_URL}/bookings/${booking._id}/accept`;

            const response = await client.messages.create({
                body: message,
                to: serviceman.phone,
                from: process.env.TWILIO_PHONE_NUMBER
            });

            return {
                success: true,
                messageId: response.sid
            };
        } catch (error) {
            console.error('SMS sending error:', error);
            throw error;
        }
    }
}

module.exports = SMSService; 