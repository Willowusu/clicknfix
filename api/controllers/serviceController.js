const Service = require('../models/service.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Service
exports.createService = async (req, res) => {
    try {
        const { provider, name, description, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(provider)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        const newService = new Service({
            provider,
            name,
            description,
            price
        });

        await newService.save();
        return res.status(201).json({ message: "Service created successfully", service: newService });

    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Service by ID
exports.getService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        const service = await Service.findById(id).populate("provider");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json(service);
    } catch (error) {
        console.error("Error retrieving service:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Service
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        if (req.body.provider && !mongoose.Types.ObjectId.isValid(req.body.provider)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json({ message: "Service updated successfully", service: updatedService });
    } catch (error) {
        console.error("Error updating service:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Service
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        const deletedService = await Service.findByIdAndDelete(id);
        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error deleting service:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
