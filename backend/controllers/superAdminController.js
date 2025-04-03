const User = require('../models/User');
const Subscription = require('../models/Subscription');
const response = require('../utils/response'); // Assuming a utility for standard responses

// Dashboard: Get system-wide stats for the Super Admin
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments();
    // Any other relevant statistics you wish to display in the dashboard
    const stats = {
      totalUsers,
      totalSubscriptions
    };

    return res.status(200).json(response(200, 'success', stats, 'Dashboard data retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching dashboard data'));
  }
};

// Get all users (for user management)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(response(200, 'success', users, 'Users retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching users'));
  }
};

// Create a new user (admin, client admin, etc.)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate if the role is correct (can be extended to more roles if needed)
    const validRoles = ['super-admin', 'provider', 'client-admin', 'client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json(response(400, 'error', null, 'Invalid role'));
    }

    // Create the user
    const newUser = new User({
      name,
      email,
      password,
      role
    });

    await newUser.save();
    return res.status(201).json(response(201, 'success', newUser, 'User created successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating user'));
  }
};

exports.createProvider = async (req, res) => {
  try {
    const { name, email, phone, address, username, password } = req.body;

    // Check if provider email already exists
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        data: null,
        message: 'Provider with this email already exists',
      });
    }

    // Create the Provider
    const provider = new Provider({
      name,
      email,
      phone,
      address,
      createdBy: req.user.id, // Assuming the Super Admin is authenticated
    });
    await provider.save();

    // Create the User associated with this Provider
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'provider',
      provider: provider._id, // Linking the user to the provider
    });
    await user.save();

    return res.status(201).json({
      code: 201,
      status: 'success',
      data: { provider, user },
      message: 'Provider registered successfully',
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      data: null,
      message: error.message,
    });
  }
};

// Update user details (name, email, role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validate if the role is correct
    const validRoles = ['super-admin', 'provider', 'client-admin', 'client'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json(response(400, 'error', null, 'Invalid role'));
    }

    // Update the user details
    const updatedUser = await User.findByIdAndUpdate(id, { name, email, role }, { new: true });

    if (!updatedUser) {
      return res.status(404).json(response(404, 'error', null, 'User not found'));
    }

    return res.status(200).json(response(200, 'success', updatedUser, 'User updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating user'));
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the user from the database
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json(response(404, 'error', null, 'User not found'));
    }

    return res.status(200).json(response(200, 'success', null, 'User deleted successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while deleting user'));
  }
};

// Get all subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({});
    return res.status(200).json(response(200, 'success', subscriptions, 'Subscriptions retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching subscriptions'));
  }
};

// Create a new subscription plan
exports.createSubscription = async (req, res) => {
  try {
    const { name, price, duration, features } = req.body;

    // Create the new subscription
    const newSubscription = new Subscription({
      name,
      price,
      duration,
      features
    });

    await newSubscription.save();
    return res.status(201).json(response(201, 'success', newSubscription, 'Subscription created successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while creating subscription'));
  }
};
