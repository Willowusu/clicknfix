const express = require('express');
const clientAdminController = require('../controllers/clientAdminController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// routes/client-admin.js
router.get('/dashboard', authenticateToken, clientAdminController.getDashboard);

// Bookings management for a branch (client admin sees all bookings across their branches)
router.get('/bookings', authenticateToken, clientAdminController.getAllBookings);  // View all bookings across branches
router.get('/bookings/:branchId', authenticateToken, clientAdminController.getBranchBookings);  // View bookings specific to a branch
router.post('/bookings/create', authenticateToken, clientAdminController.createBooking);  // Create booking for a branch
router.put('/bookings/:id/update', authenticateToken, clientAdminController.updateBooking);  // Update booking details

// Branch management for the client admin
router.get('/branches', authenticateToken, clientAdminController.getBranches);  // View branches under the admin’s organization

// Payment management (view payments for clients in their branches)
router.get('/payments', authenticateToken, clientAdminController.getPayments);  // View payment details for clients in branch
router.get('/subscriptions', authenticateToken, clientAdminController.getSubscriptions);  // View subscriptions in branch



module.exports = router;