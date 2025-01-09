const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema({
    address: {
        type: String,
        required: true,
    },
    dateTime: {
        type: Date,
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    servicemen: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Serviceman',
        required: true
    },
    customMessage: {
        type: String,
        default: null
    },
    status: [{
        status: {
            type: String,
            enum: ['added', 'accepted', 'assigned', 'ongoing', 'completed', 'declined', 'cancelled', 'ontheway', 'hold'],
            default: 'added',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    payment: {
        type: String,
        enum: ['cancelled', 'pending', 'completed'],
        default: 'pending'
    },
    bookingId: {
        type: String,
        default: Date.now
    }
})

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;