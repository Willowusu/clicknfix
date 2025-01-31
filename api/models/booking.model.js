const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
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
    serviceman: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceMan',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
        required: true
    },
    commission_fee: {
        type: mongoose.Schema.Types.Decimal128,
        default: null,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)