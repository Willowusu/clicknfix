const OrganisationType = require('../models/organisationType.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Organisation Type
exports.createOrganisationType = async (req, res) => {
    try {
        const { name, description, is_active } = req.body;

        const newOrganisationType = new OrganisationType({
            name,
            description: description || "",
            is_active: is_active ?? true
        });

        await newOrganisationType.save();
        return res.status(201).json({ message: "Organisation type created successfully", organisationType: newOrganisationType });

    } catch (error) {
        console.error("Error creating organisation type:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Organisation Type by ID
exports.getOrganisationType = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid organisation type ID" });
        }

        const organisationType = await OrganisationType.findById(id);

        if (!organisationType) {
            return res.status(404).json({ message: "Organisation type not found" });
        }

        return res.status(200).json(organisationType);
    } catch (error) {
        console.error("Error retrieving organisation type:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Organisation Type
exports.updateOrganisationType = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid organisation type ID" });
        }

        const updatedOrganisationType = await OrganisationType.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedOrganisationType) {
            return res.status(404).json({ message: "Organisation type not found" });
        }

        return res.status(200).json({ message: "Organisation type updated successfully", organisationType: updatedOrganisationType });
    } catch (error) {
        console.error("Error updating organisation type:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Organisation Type
exports.deleteOrganisationType = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid organisation type ID" });
        }

        const deletedOrganisationType = await OrganisationType.findByIdAndDelete(id);
        if (!deletedOrganisationType) {
            return res.status(404).json({ message: "Organisation type not found" });
        }

        return res.status(200).json({ message: "Organisation type deleted successfully" });
    } catch (error) {
        console.error("Error deleting organisation type:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
