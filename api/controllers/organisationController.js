const Organisation = require('../models/organisation.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Organisation
exports.createOrganisation = async (req, res) => {
  try {
    const { name, type, provider, is_active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(type) || !mongoose.Types.ObjectId.isValid(provider)) {
      return res.status(400).json({ message: "Invalid ObjectId provided for type or provider" });
    }

    const newOrganisation = new Organisation({
      name,
      type,
      provider,
      is_active: is_active ?? true
    });

    await newOrganisation.save();
    return res.status(201).json({ message: "Organisation created successfully", organisation: newOrganisation });

  } catch (error) {
    console.error("Error creating organisation:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Organisation by ID
exports.getOrganisation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organisation ID" });
    }

    const organisation = await Organisation.findById(id)
      .populate("type")
      .populate("provider");

    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    return res.status(200).json(organisation);
  } catch (error) {
    console.error("Error retrieving organisation:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update Organisation
exports.updateOrganisation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organisation ID" });
    }

    if (req.body.type && !mongoose.Types.ObjectId.isValid(req.body.type)) {
      return res.status(400).json({ message: "Invalid organisation type ID" });
    }

    if (req.body.provider && !mongoose.Types.ObjectId.isValid(req.body.provider)) {
      return res.status(400).json({ message: "Invalid provider ID" });
    }

    const updatedOrganisation = await Organisation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedOrganisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    return res.status(200).json({ message: "Organisation updated successfully", organisation: updatedOrganisation });
  } catch (error) {
    console.error("Error updating organisation:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Delete Organisation
exports.deleteOrganisation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organisation ID" });
    }

    const deletedOrganisation = await Organisation.findByIdAndDelete(id);
    if (!deletedOrganisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    return res.status(200).json({ message: "Organisation deleted successfully" });
  } catch (error) {
    console.error("Error deleting organisation:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
