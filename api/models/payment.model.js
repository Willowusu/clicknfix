const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    payment_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)