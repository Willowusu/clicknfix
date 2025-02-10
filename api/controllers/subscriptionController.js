const Subscription = require('../models/subscription.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Subscription
exports.createSubscription = async (req, res) => {
    try {
        const { plan_name, price, service_limit, commission_fee, is_white_label, custom_domain } = req.body;

        if (!plan_name || !price || !service_limit || !commission_fee) {
            return res.status(400).json({ message: "Plan name, price, service limit, and commission fee are required." });
        }

        const newSubscription = new Subscription({
            plan_name,
            price,
            service_limit,
            commission_fee,
            is_white_label,
            custom_domain
        });

        await newSubscription.save();
        return res.status(201).json({ message: "Subscription created successfully", subscription: newSubscription });

    } catch (error) {
        console.error("Error creating subscription:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Subscription by ID
exports.getSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid subscription ID" });
        }

        const subscription = await Subscription.findById(id);

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        return res.status(200).json(subscription);
    } catch (error) {
        console.error("Error retrieving subscription:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Subscription
exports.updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid subscription ID" });
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        return res.status(200).json({ message: "Subscription updated successfully", subscription: updatedSubscription });
    } catch (error) {
        console.error("Error updating subscription:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Subscription
exports.deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid subscription ID" });
        }

        const deletedSubscription = await Subscription.findByIdAndDelete(id);
        if (!deletedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        return res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
