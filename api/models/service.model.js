const mongoose = require('mongoose');

const { Schema } = mongoose;

let serviceSchema = new Schema({
    title: {
        type: String,
        default: null
    },
    zone: {
        type: String,
        default: null
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Category',
        required: true
    },
    requiredServicemen: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    serviceRate: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    durationUnit: {
        type: String,
        enum: ['minutes', 'hours'],
        required: true
    }
})

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;