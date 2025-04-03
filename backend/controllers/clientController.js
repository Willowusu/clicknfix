const Booking = require('../models/Booking');
const Branch = require('../models/Branch');
const Service = require('../models/Service');
const User = require('../models/User');
const response = require('../utils/response');  // Assuming a utility for standard responses

// Dashboard: Get relevant dashboard info for the client
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const bookings = await Booking.find({ clientId: userId });

    const upcomingBookings = bookings.filter(booking => new Date(booking.date) > new Date());
    return res.status(200).json(response(200, 'success', { upcomingBookings }, 'Dashboard data retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching dashboard data'));
  }
};

// Get client-specific bookings
exports.getBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const bookings = await Booking.find({ clientId: userId });

    return res.status(200).json(response(200, 'success', bookings, 'Bookings retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching bookings'));
  }
};

// Create a new booking for the client
exports.createBooking = async (req, res) => {
  try {
    const { branchId, serviceId, date, time } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    // Ensure the client is part of the branch’s organization
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json(response(404, 'error', null, 'Branch not found'));
    }

    // Ensure the service exists and belongs to the correct branch
    const service = await Service.findById(serviceId);
    if (!service || service.branchId.toString() !== branchId.toString()) {
      return res.status(400).json(response(400, 'error', null, 'Invalid service for this branch'));
    }

    // Create the booking
    const newBooking = new Booking({
      clientId: userId,
      branchId,
      service,
      date,
      time,
    });

    await newBooking.save();
    return res.status(201).json(response(201, 'success', newBooking, 'Booking created successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating booking'));
  }
};

// Update booking details for the client
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, service } = req.body;
    const userId = req.userId;

    // Find the booking by ID
    const booking = await Booking.findOne({ _id: id, clientId: userId });
    if (!booking) {
      return res.status(404).json(response(404, 'error', null, 'Booking not found or not authorized to update'));
    }

    // Update the booking details
    booking.date = date || booking.date;
    booking.time = time || booking.time;
    booking.service = service || booking.service;

    await booking.save();
    return res.status(200).json(response(200, 'success', booking, 'Booking updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating booking'));
  }
};
