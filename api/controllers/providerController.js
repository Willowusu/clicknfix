const Provider = require('../models/provider.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Provider
exports.createProvider = async (req, res) => {
    try {
        const { user, business_name, is_white_labeled, subscription_plan, branding } = req.body;

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (subscription_plan && !mongoose.Types.ObjectId.isValid(subscription_plan)) {
            return res.status(400).json({ message: "Invalid subscription plan ID" });
        }

        if (branding && !mongoose.Types.ObjectId.isValid(branding)) {
            return res.status(400).json({ message: "Invalid branding ID" });
        }

        const newProvider = new Provider({
            user,
            business_name,
            is_white_labeled,
            subscription_plan: subscription_plan || null,
            branding: branding || null
        });

        await newProvider.save();
        return res.status(201).json({ message: "Provider created successfully", provider: newProvider });

    } catch (error) {
        console.error("Error creating provider:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Provider by ID
exports.getProvider = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        const provider = await Provider.findById(id)
            .populate("user")
            .populate("subscription_plan")
            .populate("branding");

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        return res.status(200).json(provider);
    } catch (error) {
        console.error("Error retrieving provider:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Provider
exports.updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        if (req.body.user && !mongoose.Types.ObjectId.isValid(req.body.user)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (req.body.subscription_plan && !mongoose.Types.ObjectId.isValid(req.body.subscription_plan)) {
            return res.status(400).json({ message: "Invalid subscription plan ID" });
        }

        if (req.body.branding && !mongoose.Types.ObjectId.isValid(req.body.branding)) {
            return res.status(400).json({ message: "Invalid branding ID" });
        }

        const updatedProvider = await Provider.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedProvider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        return res.status(200).json({ message: "Provider updated successfully", provider: updatedProvider });
    } catch (error) {
        console.error("Error updating provider:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Provider
exports.deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        const deletedProvider = await Provider.findByIdAndDelete(id);
        if (!deletedProvider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        return res.status(200).json({ message: "Provider deleted successfully" });
    } catch (error) {
        console.error("Error deleting provider:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
