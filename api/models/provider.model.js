const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const providerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    business_name: {
        type: String,
        required: true
    },
    is_white_labeled: {
        type: Boolean,
        required: true
    },
    subscription_plan: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null,
    },
    branding: {
        type: Schema.Types.ObjectId,
        ref: 'WhiteLabelSettings',
        default: null,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Provider', providerSchema)