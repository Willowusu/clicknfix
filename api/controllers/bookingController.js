const Booking = require('../models/booking.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { customer, requested_by, requested_by_role, service, serviceman, organisation, branch, commission_fee } = req.body;

    if (!mongoose.Types.ObjectId.isValid(customer) ||
      !mongoose.Types.ObjectId.isValid(requested_by) ||
      !mongoose.Types.ObjectId.isValid(service) ||
      !mongoose.Types.ObjectId.isValid(serviceman) ||
      !mongoose.Types.ObjectId.isValid(organisation)) {
      return res.status(400).json({ message: "Invalid ObjectId provided" });
    }

    const newBooking = new Booking({
      customer,
      requested_by,
      requested_by_role,
      service,
      serviceman,
      organisation,
      branch: branch || null,
      commission_fee
    });

    await newBooking.save();
    return res.status(201).json({ message: "Booking created successfully", booking: newBooking });

  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Booking by ID
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id)
      .populate("customer")
      .populate("requested_by")
      .populate("service")
      .populate("serviceman")
      .populate("organisation")
      .populate("branch");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("Error retrieving booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update Booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
