const Booking = require('../models/Booking');  // Assuming you have a Booking model
const User = require('../models/User');  // Assuming a User model to check roles
const Organization = require('../models/Organization');  // Assuming an Organization model
const Branch = require('../models/Branch');  // Assuming a Branch model
const Service = require('../models/Service');  // Assuming a Service model
const response = require('../utils/response');  // Assuming a utility for standard responses
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'booking-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
    const { branchId, serviceId, date, time, description } = req.body;
    const { role, user } = req;
    const image = req.file ? req.file.filename : null;

    // Validate required fields
    if (!branchId || !serviceId || !date || !time || !description) {
      return res.status(400).json(response(400, 'error', null, 'All fields are required'));
    }

    // Validate date and time format
    const bookingTime = new Date(`${date}T${time}`);
    if (isNaN(bookingTime.getTime())) {
      return res.status(400).json(response(400, 'error', null, 'Invalid date or time format'));
    }

    // Check if booking time is in the future
    if (bookingTime < new Date()) {
      return res.status(400).json(response(400, 'error', null, 'Booking time must be in the future'));
    }

    // Validate branch exists and user has access
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json(response(404, 'error', null, 'Branch not found'));
    }

    // For clients and client-admins, validate branch access
    if (role === 'client' || role === 'client-admin') {
      if (user.branch.toString() !== branchId) {
        return res.status(403).json(response(403, 'error', null, 'You can only create bookings for your branch'));
      }
    }

    // Validate service exists and is available in the branch
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json(response(404, 'error', null, 'Service not found'));
    }

    // Create a new booking
    const newBooking = new Booking({
      branch: branchId,
      service: serviceId,
      client: user._id, // Use the authenticated user's ID
      bookingTime,
      description,
      image,
      provider: user.provider,
      organization: user.organization,
      status: 'pending'
    });

    await newBooking.save();

    // Populate relevant fields for response
    await newBooking.populate([
      { path: 'client', select: 'name email phone' },
      { path: 'branch', select: 'name address' },
      { path: 'service', select: 'name price duration' }
    ]);

    return res.status(201).json(response(201, 'success', newBooking, 'Booking created successfully'));
  } catch (error) {
    console.error('Error in createBooking:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error while creating booking'));
  }
};

// Multer middleware for handling file uploads
exports.uploadImage = upload.single('image');

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
