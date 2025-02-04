const Booking = require("../models/booking.model");
const ServiceMan = require("../models/serviceman.model");
const Client = require("../models/client.model");
const ClientAdmin = require("../models/clientAdmin.model");
const Organisation = require("../models/organisation.model");
const Branch = require("../models/branch.model");



// Create a Booking (Client or Client Admin)
exports.createBooking = async (req, res) => {
  try {
    const { customer, requested_by, requested_by_role, service, organisation, branch, commission_fee } = req.body;

    // Validate role
    if (!["Customer", "ClientAdmin"].includes(requested_by_role)) {
      return res.status(400).json({ error: "Invalid requested_by_role. Must be Customer or ClientAdmin." });
    }

    // Ensure the requested_by exists in the correct model
    const requester = requested_by_role === "Customer" 
      ? await Client.findById(requested_by)
      : await ClientAdmin.findById(requested_by);
    
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    // Check if the service belongs to the Organisation
    const org = await Organisation.findById(organisation);
    if (!org) return res.status(404).json({ error: "Organisation not found" });

    // Find an available serviceman from the same organisation (optional branch filter)
    let servicemanQuery = { organisation };
    if (branch) servicemanQuery.branch = branch;

    const serviceman = await ServiceMan.findOne(servicemanQuery);
    if (!serviceman) {
      return res.status(404).json({ error: "No available serviceman found for this organisation/branch" });
    }

    // Create booking
    const newBooking = new Booking({
      customer,
      requested_by,
      requested_by_role,
      service,
      serviceman,
      organisation,
      branch: branch || null,
      status: "pending",
      commission_fee,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "in_progress", "completed", "canceled", "failed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Bookings (Filter by organisation, branch, and requester role)
exports.getBookings = async (req, res) => {
  try {
    const { organisation, branch, requested_by_role } = req.query;
    let query = {};

    if (organisation) query.organisation = organisation;
    if (branch) query.branch = branch;
    if (requested_by_role) query.requested_by_role = requested_by_role;

    const bookings = await Booking.find(query)
      .populate("customer", "name email")
      .populate("service", "name")
      .populate("serviceman", "name phone")
      .populate("organisation", "name")
      .populate("branch", "name");

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
