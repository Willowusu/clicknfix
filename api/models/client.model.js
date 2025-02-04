const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clientSchema = new mongoose.Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: { 
            type: String, 
            required: true 
        },
        phone: { 
            type: String, 
            required: true 
        },
        organisation: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Organisation", 
            required: true 
        },
        branch: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Branch", 
            required: true 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema)