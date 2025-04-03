const express = require('express');
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// routes/client.js
router.get('/dashboard', authenticateToken, clientController.getDashboard);  // View dashboard
router.get('/bookings', authenticateToken, clientController.getBookings);  // View client-specific bookings
router.post('/bookings/create', authenticateToken, clientController.createBooking);  // Create new booking
router.put('/bookings/:id/update', authenticateToken, clientController.updateBooking);  // Update booking details


module.exports = router;