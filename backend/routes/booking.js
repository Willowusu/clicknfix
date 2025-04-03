const express = require('express');
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// GET /api/bookings
router.get('/', authenticateToken, bookingController.getAllBookings);

// POST /api/bookings/create
router.post('/create',authenticateToken, bookingController.uploadImage, bookingController.createBooking);

// PUT /api/bookings/{id}
router.put('/:id', authenticateToken, bookingController.updateBooking);

// DELETE /api/bookings/{id}
router.delete('/:id', authenticateToken, bookingController.deleteBooking);

module.exports = router;