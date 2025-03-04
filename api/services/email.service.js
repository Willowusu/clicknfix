require('dotenv').config()
const nodemailer = require('nodemailer');
const Email = require('email-templates');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const email = new Email({
    transport: transporter,
    send: true,
    preview: process.env.NODE_ENV === 'development',
    views: {
        root: 'api/templates/emails',
        options: {
            extension: 'ejs'
        }
    }
});

class EmailService {
    static async sendNotification(recipient, notification) {
        try {
            await email.send({
                template: `notification-${notification.type}`,
                message: {
                    to: recipient.email
                },
                locals: {
                    notification,
                    recipient
                }
            });

            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    static async sendBookingConfirmation(booking) {
        try {
            await email.send({
                template: 'booking-confirmation',
                message: {
                    to: booking.customer.email
                },
                locals: {
                    booking,
                    trackingUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}`
                }
            });

            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    static async sendServicemanAssignment(booking, serviceman) {
        try {
            await email.send({
                template: 'serviceman-assignment',
                message: {
                    to: serviceman.email
                },
                locals: {
                    booking,
                    serviceman,
                    acceptUrl: `${process.env.FRONTEND_URL}/bookings/${booking._id}/accept`
                }
            });

            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }
}

module.exports = EmailService; 