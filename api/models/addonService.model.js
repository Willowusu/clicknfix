const mongoose = require('mongoose');

const { Schema } = mongoose;

const addonServiceSchema = new Schema({
    image: {
        type: String,
        default: null
    },
    service: {
        type: Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
})

const AddonService = mongoose.model('AddonService', addonServiceSchema);
module.exports = AddonService;
