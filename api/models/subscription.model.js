const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    plan_name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: v => v ? parseFloat(v.toString()) : null
    },
    service_limit: {
        type: Number,
        required: true
    },
    commission_fee: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        get: v => v ? parseFloat(v.toString()) : null
    },
    is_white_label: {
        type: Boolean,
        required: true
    },
    custom_domain: {
        type: Boolean,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('Subscription', subscriptionSchema)