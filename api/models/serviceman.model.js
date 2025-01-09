const mongoose = require('mongoose');

const { Schema } = mongoose;

let servicemanSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    image: {
        type: String,
        default: null
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    experienceDuration: {
        type: String,
        required: true
    },
    experienceInterval: {
        type: String,
        enum: ['months', 'years'],
        required: true
    },
    knownLanguages: {
        type: [String],
        default: null
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    isAvailable: {
        type: String,
        default: true,
        required: true
    },
    country: {
        type: String,
        default: null
    },
    address: {
        type: String,
        required: true
    },
    areaLocality: {
        type: String,
        required: true
    },
    stateRegion: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postcode: {
        type: String,
        default: null
    }
})

const Serviceman = mongoose.model('Serviceman', servicemanSchema);
module.exports = Serviceman;