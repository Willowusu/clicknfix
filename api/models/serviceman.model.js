const mongoose = require("mongoose");

const servicemanSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        unique: true 
    },
    provider: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Provider", 
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
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }], // Services they can offer
    status: {
        type: String,
        enum: ["pending", "active", "inactive"],
        default: "pending"
    },
    location: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        coordinates: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], index: "2dsphere", required: true } // Ensure it's required
        }
    }

}, { timestamps: true });

module.exports = mongoose.model("ServiceMan", servicemanSchema);
