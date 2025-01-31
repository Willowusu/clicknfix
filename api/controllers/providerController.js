const Service = require('../models/service.model.js');
const Booking = require('../models/booking.model.js');


const createService = async (req, res) => {
    const { provider, name, description, price } = req.body;
    try {
        const service = await Service.create({ provider, name, description, price });
        res.status(200).json(service)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const viewServices = async (req, res) => {
    const {providerId} = req.body;
    try {
         let services = await Service.find({provider: providerId});
            res.status(200).json(services)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const assignServiceman = async (req, res) => {
    const {bookingId, servicemanId, commissionFee} = req.body;
    try {
        let booking = await Booking.findOneAndUpdate({_id: bookingId}, {serviceman: servicemanId, commission_fee: commissionFee});
        res.status(200).json(booking)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const viewBookings = async (req, res) => {
    const {providerId} = req.body
    try {
        let bookings = await Booking.find({provider: providerId});
        res.status(200).json(bookings)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { createService, viewServices, assignServiceman, viewBookings }