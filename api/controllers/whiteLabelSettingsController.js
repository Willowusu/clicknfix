const WhiteLabelSettings = require('../models/whiteLabelSettings.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create WhiteLabelSettings
exports.createWhiteLabelSettings = async (req, res) => {
    try {
        const { provider, primary_color, logo_url, custom_domain } = req.body;

        if (!mongoose.Types.ObjectId.isValid(provider)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        const newWhiteLabelSettings = new WhiteLabelSettings({
            provider,
            primary_color,
            logo_url,
            custom_domain
        });

        await newWhiteLabelSettings.save();
        return res.status(201).json({ message: "WhiteLabelSettings created successfully", whiteLabelSettings: newWhiteLabelSettings });

    } catch (error) {
        console.error("Error creating white label settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get WhiteLabelSettings by ID
exports.getWhiteLabelSettings = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid white label settings ID" });
        }

        const whiteLabelSettings = await WhiteLabelSettings.findById(id).populate("provider");

        if (!whiteLabelSettings) {
            return res.status(404).json({ message: "WhiteLabelSettings not found" });
        }

        return res.status(200).json(whiteLabelSettings);
    } catch (error) {
        console.error("Error retrieving white label settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update WhiteLabelSettings
exports.updateWhiteLabelSettings = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid white label settings ID" });
        }

        if (req.body.provider && !mongoose.Types.ObjectId.isValid(req.body.provider)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        const updatedWhiteLabelSettings = await WhiteLabelSettings.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedWhiteLabelSettings) {
            return res.status(404).json({ message: "WhiteLabelSettings not found" });
        }

        return res.status(200).json({ message: "WhiteLabelSettings updated successfully", whiteLabelSettings: updatedWhiteLabelSettings });
    } catch (error) {
        console.error("Error updating white label settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete WhiteLabelSettings
exports.deleteWhiteLabelSettings = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid white label settings ID" });
        }

        const deletedWhiteLabelSettings = await WhiteLabelSettings.findByIdAndDelete(id);
        if (!deletedWhiteLabelSettings) {
            return res.status(404).json({ message: "WhiteLabelSettings not found" });
        }

        return res.status(200).json({ message: "WhiteLabelSettings deleted successfully" });
    } catch (error) {
        console.error("Error deleting white label settings:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
