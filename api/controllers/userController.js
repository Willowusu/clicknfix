const User = require('../models/user.model'); // Assuming the model is in /models
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ✅ Create User
exports.createUser = async (req, res) => {
    try {
        const { email, password, role, is_active } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password, and role are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            is_active: is_active ?? true
        });

        await newUser.save();
        return res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get User(s) - By ID, All Users, or Filter by Role
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.query; // Extract role filter from query parameters

        // 🔹 If an ID is provided, return a single user
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }

            const user = await User.findById(id).select('-password'); // Exclude password

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json(user);
        }

        // 🔹 If no ID is provided, fetch all users (optionally filtered by role)
        let filter = {}; // Default: no filters, fetch all users
        if (role) {
            filter.role = role; // Apply role filter if provided
        }

        const users = await User.find(filter).select('-password'); // Exclude passwords from all users

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error retrieving user(s):", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// ✅ Update User
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...updateData } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (updateData.email) {
            const existingUser = await User.findOne({ email: updateData.email });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({ message: "Email already in use by another user." });
            }
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
