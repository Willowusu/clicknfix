const Booking = require('../models/Booking');  // Assuming you have a Booking model
const User = require('../models/User');  // Assuming a User model to check roles
const Organization = require('../models/Organization');  // Assuming an Organization model
const Branch = require('../models/Branch');  // Assuming a Branch model
const response = require('../utils/response');  // Assuming a utility for standard responses

// GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.role;
    
    const user = await User.findById(userId);

    // If the user is a provider, return bookings for all their organizations' branches
    if (role === 'provider') {
      // Get all organizations for this provider
      const organizations = await Organization.find({ provider: user.provider });
      // Get all branches for these organizations
      const branches = await Branch.find({ organization: { $in: organizations.map(org => org._id) } });
      // Get all bookings for these branches
      const bookings = await Booking.find({ branch: { $in: branches.map(branch => branch._id) } })
        .populate('client', '-password')
        .populate('branch')
        .populate('service')
        .populate('serviceman');

      return res.status(200).json(response(200, 'success', bookings, 'Bookings retrieved successfully'));
    }

    // If the user is a super-admin, return all bookings
    if (role === 'super-admin') {
      const bookings = await Booking.find()
        .populate('client', '-password')
        .populate('branch')
        .populate('service')
        .populate('serviceman');
      return res.status(200).json(response(200, 'success', bookings, 'Bookings retrieved successfully'));
    }

    // If the user is a client-admin or client, only return bookings for their branch
    const branchId = user.branch;  // Assuming user has a branchId
    const bookings = await Booking.find({ branch: branchId })
      .populate('client', '-password')
      .populate('branch')
      .populate('service')
      .populate('serviceman');

    return res.status(200).json(response(200, 'success', bookings, 'Bookings retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching bookings'));
  }
};

// POST /api/bookings/create
exports.createBooking = async (req, res) => {
  try {
    const { branchId, serviceId, clientId, date, time } = req.body;
    const userId = req.userId;
    const role = req.role;

    // Only allow client-admins and clients to create bookings for their own branch
    const user = await User.findById(userId);
    if (role === 'client' || role === 'client-admin') {
      if (user.branch.toString() !== branchId.toString()) {
        return res.status(403).json(response(403, 'error', null, 'You can only create bookings for your branch'));
      }
    }

    // Create new booking
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

// PUT /api/bookings/{id}
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, serviceId, clientId } = req.body;
    const userId = req.userId;
    const role = req.role;

    // Find the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json(response(404, 'error', null, 'Booking not found'));
    }

    // If the user is a provider or super-admin, they can update any booking
    if (role === 'provider' || role === 'super-admin') {
      booking.date = date || booking.date;
      booking.time = time || booking.time;
      booking.serviceId = serviceId || booking.serviceId;
      booking.clientId = clientId || booking.clientId;

      await booking.save();
      return res.status(200).json(response(200, 'success', booking, 'Booking updated successfully'));
    }

    // If the user is a client-admin or client, they can only update bookings for their branch
    const user = await User.findById(userId);
    if (user.branch.toString() !== booking.branch.toString()) {
      return res.status(403).json(response(403, 'error', null, 'You can only update bookings for your branch'));
    }

    // Allow updates if the user has the right permissions
    booking.date = date || booking.date;
    booking.time = time || booking.time;
    booking.serviceId = serviceId || booking.serviceId;
    booking.clientId = clientId || booking.clientId;

    await booking.save();

    return res.status(200).json(response(200, 'success', booking, 'Booking updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating booking'));
  }
};

// DELETE /api/bookings/{id}
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const role = req.role;

    // Find the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json(response(404, 'error', null, 'Booking not found'));
    }

    // Only provider or super-admin can delete bookings
    if (role === 'provider' || role === 'super-admin') {
      await booking.remove();
      return res.status(200).json(response(200, 'success', null, 'Booking deleted successfully'));
    }

    // Client-admins and clients can only delete bookings for their branch
    const user = await User.findById(userId);
    if (user.branch.toString() !== booking.branch.toString()) {
      return res.status(403).json(response(403, 'error', null, 'You can only delete bookings for your branch'));
    }

    // Allow client-admin to delete booking
    await booking.remove();
    return res.status(200).json(response(200, 'success', null, 'Booking deleted successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting booking'));
  }
};
