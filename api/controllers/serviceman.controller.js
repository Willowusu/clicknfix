const Serviceman = require('../models/serviceman.model');
const Booking = require('../models/booking.model');
const errsole = require('errsole');

exports.viewProfile = async function (req, res) {
    let { servicemanId } = req.body;
    try {
        const profile = await Serviceman.findById(servicemanId);
        if (!profile) {
            return res.send({ status: "failed", message: "No servicemman found with id" })
        }
        return res.send({ status: "success", message: "Serviceman profile successfully retrieved", data: profile })

    } catch (error) {
        errsole.error("An error occurred while retrieving the serviceman profile", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the serviceman profile" })
    }
}

exports.viewBooking = async function(req, res){
    let {bookingId, servicemanId} = req.body;
    try{
        const booking = await Booking.findOne({bookingId, servicemen: servicemanId});
        return res.send({status: "success", message: "Booking successfully retrieved", data: booking})
    } catch(error){
        errsole.error("An error occurred while retrieving booking", error);
        return res.send({status: "error", message: "An error occurred while retrieving the booking"})
    }
}

exports.viewAllBooking = async function(req, res){
    let { servicemanId } = req.body;
    try {
        const bookings = await Booking.find({servicemen: servicemanId });
        return res.send({ status: "success", message: "Bookings successfully retrieved", data: bookings })
    } catch (error) {
        errsole.error("An error occurred while retrieving bookings", error);
        return res.send({ status: "error", message: "An error occurred while retrieving the bookings" })
    }
}

exports.editProfile = async function (req, res) {
    let { servicemanId, updateDetails } = req.body;
    try {
        const profile = await Serviceman.findOneAndUpdate({ _id: servicemanId }, updateDetails, {new: true});
        return res.send({ status: "success", message: "Serviceman profile successfully updated", data: profile })
    } catch (error) {
        errsole.error("An error occurred while updating the serviceman profile", error);
        return res.send({ status: "failed", message: "An error occurred while updating the serviceman profile" })
    }
}