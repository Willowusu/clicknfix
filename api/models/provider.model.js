const mongoose = require('mongoose');

const {Schema} = mongoose;

const providerSchema = new Schema({
    type: {
        type: String,
        enum: ['company', 'freelance'],
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
    experienceInterval: {
        type: String,
        enum: ['months', 'years'],
        required: true
    },
    experienceDuration: {
        type: String,
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
    address: {
        type: String,
        required: true
    },
    areaLocality: {
        type: String,
        required: true
    },
    country: {
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
    },
    companyLogo: {
        type: String,
        required: function () {
            return this.type === 'company'; // Require if type is "company"
        },
        default: null
    },
    companyName: {
        type: String,
        required: function () {
            return this.type === 'company'; // Require if type is "company"
        },
        default: null
    },
    companyEmail: {
        type: String,
        required: function () {
            return this.type === 'company'; // Require if type is "company"
        },
        default: null
    },
    companyPhone: {
        type: String,
        required: function () {
            return this.type === 'company'; // Require if type is "company"
        },
        default: null
    },
    companyDescription: {
        type: String,
        default: null
    }

})

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
