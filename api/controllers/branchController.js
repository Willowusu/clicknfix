const Branch = require('../models/branch.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Branch
exports.createBranch = async (req, res) => {
    try {
        const { name, organisation, location, phone, clients, is_active } = req.body;

        if (!mongoose.Types.ObjectId.isValid(organisation)) {
            return res.status(400).json({ message: "Invalid organisation ID" });
        }

        const newBranch = new Branch({
            name,
            organisation,
            location: location || "",
            phone: phone || "",
            clients: clients || [],
            is_active: is_active ?? true
        });

        await newBranch.save();
        return res.status(201).json({ message: "Branch created successfully", branch: newBranch });

    } catch (error) {
        console.error("Error creating branch:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Branch by ID
exports.getBranch = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid branch ID" });
        }

        const branch = await Branch.findById(id)
            .populate("organisation")
            .populate("clients");

        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json(branch);
    } catch (error) {
        console.error("Error retrieving branch:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Branch
exports.updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid branch ID" });
        }

        if (req.body.organisation && !mongoose.Types.ObjectId.isValid(req.body.organisation)) {
            return res.status(400).json({ message: "Invalid organisation ID" });
        }

        const updatedBranch = await Branch.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedBranch) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json({ message: "Branch updated successfully", branch: updatedBranch });
    } catch (error) {
        console.error("Error updating branch:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Branch
exports.deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid branch ID" });
        }

        const deletedBranch = await Branch.findByIdAndDelete(id);
        if (!deletedBranch) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json({ message: "Branch deleted successfully" });
    } catch (error) {
        console.error("Error deleting branch:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
