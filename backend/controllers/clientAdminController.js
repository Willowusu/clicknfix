const Booking = require('../models/Booking');
const Branch = require('../models/Branch');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const response = require('../utils/response');  // Assuming a utility for standard responses

// Dashboard: Get relevant dashboard info for the client-admin
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const branches = await Branch.find({ organizationId: user.organizationId });

    const bookingsCount = await Booking.countDocuments({ branchId: { $in: branches.map(b => b._id) } });
    const payments = await Payment.aggregate([
      { $match: { branchId: { $in: branches.map(b => b._id) } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);

    return res.status(200).json(response(200, 'success', { bookingsCount, totalPayments: payments[0]?.totalAmount || 0 }, 'Dashboard data retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching dashboard data'));
  }
};

// Get all bookings across the client-admin’s branches
exports.getAllBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const branches = await Branch.find({ organizationId: user.organizationId });

    const bookings = await Booking.find({ branchId: { $in: branches.map(b => b._id) } });
    return res.status(200).json(response(200, 'success', bookings, 'Bookings retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching bookings'));
  }
};

// Get bookings specific to a branch
exports.getBranchBookings = async (req, res) => {
  try {
    const { branchId } = req.params;
    const userId = req.userId;
    const user = await User.findById(userId);

    // Ensure that the client-admin has access to the branch
    const branch = await Branch.findOne({ _id: branchId, organization: user.organization });
    if (!branch) {
      return res.status(403).json(response(403, 'error', null, 'Access to this branch is denied'));
    }

    const bookings = await Booking.find({ branchId });
    return res.status(200).json(response(200, 'success', bookings, 'Bookings for branch retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching branch bookings'));
  }
};

// Create booking for a branch
exports.createBooking = async (req, res) => {
  try {
    const { branchId, serviceId, clientId, date, time } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    // Ensure that the client-admin has access to the branch
    const branch = await Branch.findOne({ _id: branchId, organization: user.organization });
    if (!branch) {
      return res.status(403).json(response(403, 'error', null, 'You do not have access to this branch'));
    }

    // Create the booking
    const newBooking = new Booking({
      branchId,
      serviceId,
      clientId,
      date,
      time,
      createdBy: userId,  // Assuming userId is logged in user
    });

    await newBooking.save();
    return res.status(201).json(response(201, 'success', newBooking, 'Booking created successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating booking'));
  }
};

// Update booking details
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, serviceId, clientId } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    // Find the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json(response(404, 'error', null, 'Booking not found'));
    }

    // Ensure the client-admin has access to the branch
    const branch = await Branch.findOne({ _id: booking.branch, organization: user.organization });
    if (!branch) {
      return res.status(403).json(response(403, 'error', null, 'You do not have access to this booking’s branch'));
    }

    // Update booking
    booking.bookingTime = date || booking.bookingTime;
    booking.service = serviceId || booking.service;
    booking.client = clientId || booking.client;

    await booking.save();
    return res.status(200).json(response(200, 'success', booking, 'Booking updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating booking'));
  }
};

// Get all branches under the client-admin’s organization
exports.getBranches = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    // Fetch branches belonging to the client-admin's organization
    const branches = await Branch.find({ organization: user.organization });
    return res.status(200).json(response(200, 'success', branches, 'Branches retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching branches'));
  }
};

// Get all payments for clients in the client-admin’s branches
exports.getPayments = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const branches = await Branch.find({ organization: user.organization });

    const payments = await Payment.find({ branchId: { $in: branches.map(b => b._id) } });
    return res.status(200).json(response(200, 'success', payments, 'Payments retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching payments'));
  }
};

// Get all subscriptions for the client-admin’s branches
exports.getSubscriptions = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const branches = await Branch.find({ organization: user.organization });

    const subscriptions = await Subscription.find({ branchId: { $in: branches.map(b => b._id) } });
    return res.status(200).json(response(200, 'success', subscriptions, 'Subscriptions retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching subscriptions'));
  }
};
