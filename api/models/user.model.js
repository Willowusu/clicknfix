const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'provider', 'serviceman', 'super_admin', 'client_admin'],
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)