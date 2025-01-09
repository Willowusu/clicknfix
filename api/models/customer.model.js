const mongoose = require('mongoose');

const { Schema } = mongoose;

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },
    address: [{
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
        }
    }],
    password: {
        type: String,
        required: true
    }
})

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;