const Booking = require('../models/booking.model.js');


const bookService = async (req, res) => {
    const { customer, service, serviceman } = req.body;
    try {
        const booking = await Booking.create({ customer, service, serviceman });
        res.status(200).json(booking)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const viewBookings = async (req, res) => {
    const { customer } = req.body
    try {
        let bookings = await Booking.find({ customer });
        res.status(200).json(bookings)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { bookService, viewBookings }