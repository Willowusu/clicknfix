const ClientAdmin = require('../models/clientAdmin.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Client Admin
exports.createClientAdmin = async (req, res) => {
    try {
        const { user, name, organisation, branches, canRequestServicesForClients } = req.body;

        if (!mongoose.Types.ObjectId.isValid(user) ||
            !mongoose.Types.ObjectId.isValid(organisation)) {
            return res.status(400).json({ message: "Invalid ObjectId provided" });
        }

        if (branches && !branches.every(id => mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid branch IDs provided" });
        }

        const newClientAdmin = new ClientAdmin({
            user,
            name,
            organisation,
            branches: branches || [],
            canRequestServicesForClients: canRequestServicesForClients ?? true
        });

        await newClientAdmin.save();
        return res.status(201).json({ message: "Client Admin created successfully", clientAdmin: newClientAdmin });

    } catch (error) {
        console.error("Error creating client admin:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Client Admin by ID
exports.getClientAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid client admin ID" });
        }

        const clientAdmin = await ClientAdmin.findById(id)
            .populate("user")
            .populate("organisation")
            .populate("branches");

        if (!clientAdmin) {
            return res.status(404).json({ message: "Client Admin not found" });
        }

        return res.status(200).json(clientAdmin);
    } catch (error) {
        console.error("Error retrieving client admin:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Client Admin
exports.updateClientAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid client admin ID" });
        }

        if (req.body.organisation && !mongoose.Types.ObjectId.isValid(req.body.organisation)) {
            return res.status(400).json({ message: "Invalid organisation ID" });
        }

        if (req.body.branches && !req.body.branches.every(id => mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid branch IDs provided" });
        }

        const updatedClientAdmin = await ClientAdmin.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedClientAdmin) {
            return res.status(404).json({ message: "Client Admin not found" });
        }

        return res.status(200).json({ message: "Client Admin updated successfully", clientAdmin: updatedClientAdmin });
    } catch (error) {
        console.error("Error updating client admin:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Client Admin
exports.deleteClientAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid client admin ID" });
        }

        const deletedClientAdmin = await ClientAdmin.findByIdAndDelete(id);
        if (!deletedClientAdmin) {
            return res.status(404).json({ message: "Client Admin not found" });
        }

        return res.status(200).json({ message: "Client Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting client admin:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
