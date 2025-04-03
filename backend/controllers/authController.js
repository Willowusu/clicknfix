const User = require('../models/User');  // Assuming you have a User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');  // For sending emails (password reset)
const response = require('../utils/response');  // Assuming a utility for standard responses


// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;  // Now accepting role in registration

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(response(400, 'error', null, 'User already exists'));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ username, email, password: hashedPassword, role });  // Store role
    await user.save();

    return res.status(201).json(response(201, 'success', user, 'User registered successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error during registration'));
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(response(400, 'error', null, 'User not found'));
    }


    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(response(400, 'error', null, 'Invalid credentials'));
    }

    // Generate JWT token with role info
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    //remove sensitive data
    user.password = undefined;

    return res.status(200).json(response(200, 'success', { token, user }, 'Login successful'));
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json(response(500, 'error', null, 'Server error during login'));
  }
};

// Logout user
exports.logout = (req, res) => {
  // In case of token-based authentication, logout typically means removing the token from client-side storage
  return res.status(200).json(response(200, 'success', null, 'Logout successful'));
};

// Get logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;  // From JWT token middleware
    const user = await User.findById(userId).select('-password').populate('branch').populate('organization');
    if (!user) {
      return res.status(404).json(response(404, 'error', null, 'User not found'));
    }

    return res.status(200).json(response(200, 'success', user, 'Profile retrieved successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while fetching profile'));
  }
};

// Update profile details
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, role } = req.body;  // Allowing update of role

    // Check if user is allowed to update their role
    const currentUser = await User.findById(userId);
    if (currentUser.role !== 'super-admin') {
      return res.status(403).json(response(403, 'error', null, 'You do not have permission to change role'));
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(userId, { username, email, role }, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json(response(404, 'error', null, 'User not found'));
    }

    return res.status(200).json(response(200, 'success', updatedUser, 'Profile updated successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while updating profile'));
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(response(400, 'error', null, 'User not found'));
    }

    // Generate password reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email with reset link
    const transporter = nodemailer.createTransport({ /* SMTP configuration */ });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click the following link to reset your password: <a href="${resetUrl}">Reset Password</a></p>`,
    });

    return res.status(200).json(response(200, 'success', null, 'Password reset email sent'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while requesting password reset'));
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json(response(404, 'error', null, 'User not found'));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json(response(200, 'success', null, 'Password changed successfully'));
  } catch (error) {
    return res.status(500).json(response(500, 'error', null, 'Server error while changing password'));
  }
};
