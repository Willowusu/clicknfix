const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ["white_label", "open_marketplace"],
        required: true
    },
    price: { type: Number, required: true, default: 0 },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
    commissionPercentage: { type: Number, required: true, default: 0 },
    maxServicemen: { type: Number, required: true, default: 0 },
    maxBranches: { type: Number, required: true, default: 0 },
    maxClients: { type: String, required: true, default: "unlimited" },

    // Features
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    analyticsDashboard: { type: Boolean, default: false },
    whiteLabelDomain: { type: Boolean, default: false },
    featuredListing: { type: Boolean, default: false },

    // Timestamps
}, { timestamps: true });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
