const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const whiteLabelSettingsSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
        unique: true
    },
    primary_color: {
        type: String,
        required: true
    },
    logo_url: {
        type: String,
        required: true
    },
    custom_domain: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('WhiteLabelSettings', whiteLabelSettingsSchema)