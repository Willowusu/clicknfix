const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clientAdminSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation", required: true
    },
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    canRequestServicesForClients: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Client Admin', clientAdminSchema)