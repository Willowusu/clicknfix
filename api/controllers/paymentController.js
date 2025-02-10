const Payment = require('../models/payment.model'); // Assuming the model is in /models
const mongoose = require('mongoose');

// ✅ Create Payment
exports.createPayment = async (req, res) => {
    try {
        const { provider, amount, payment_date, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(provider)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        if (!["pending", "completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'pending' or 'completed'." });
        }

        const newPayment = new Payment({
            provider,
            amount,
            payment_date: payment_date || Date.now(),
            status
        });

        await newPayment.save();
        return res.status(201).json({ message: "Payment created successfully", payment: newPayment });

    } catch (error) {
        console.error("Error creating payment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get Payment by ID
exports.getPayment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        const payment = await Payment.findById(id).populate("provider");

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json(payment);
    } catch (error) {
        console.error("Error retrieving payment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Payment
exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        if (req.body.provider && !mongoose.Types.ObjectId.isValid(req.body.provider)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        if (req.body.status && !["pending", "completed"].includes(req.body.status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'pending' or 'completed'." });
        }

        const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json({ message: "Payment updated successfully", payment: updatedPayment });
    } catch (error) {
        console.error("Error updating payment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Payment
exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        const deletedPayment = await Payment.findByIdAndDelete(id);
        if (!deletedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        console.error("Error deleting payment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
