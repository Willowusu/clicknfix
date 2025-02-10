const Client = require('../models/client.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Client
exports.createClient = async (req, res) => {
  try {
    const { user, name, phone, organisation, branch } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user) ||
      !mongoose.Types.ObjectId.isValid(organisation) ||
      !mongoose.Types.ObjectId.isValid(branch)) {
      return res.status(400).json({ message: "Invalid ObjectId provided" });
    }

    const newClient = new Client({
      user,
      name,
      phone,
      organisation,
      branch
    });

    await newClient.save();
    return res.status(201).json({ message: "Client created successfully", client: newClient });

  } catch (error) {
    console.error("Error creating client:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Client by ID
exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const client = await Client.findById(id)
      .populate("user")
      .populate("organisation")
      .populate("branch");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json(client);
  } catch (error) {
    console.error("Error retrieving client:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update Client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    if (req.body.organisation && !mongoose.Types.ObjectId.isValid(req.body.organisation)) {
      return res.status(400).json({ message: "Invalid organisation ID" });
    }

    if (req.body.branch && !mongoose.Types.ObjectId.isValid(req.body.branch)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }

    const updatedClient = await Client.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({ message: "Client updated successfully", client: updatedClient });
  } catch (error) {
    console.error("Error updating client:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Delete Client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const deletedClient = await Client.findByIdAndDelete(id);
    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
