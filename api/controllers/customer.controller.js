const Customer = require('../models/customer.model');
const Booking = require('../models/booking.model');
const bcrypt = require('bcrypt');
const errsole = require('errsole');
require('dotenv').config();

exports.createAccount = async function (req, res) {
    let requestDetails = req.body;
    //TODO: call external function that validates account information
    const salt = await bcrypt.genSalt(10);
    requestDetails.password = await bcrypt.hash(requestDetails['password'], salt); //no reason for square bracket and dot notation change
    try {
        const customer = new Customer(requestDetails);
        await customer.save();
        delete customer.password;
        return res.send({ status: "success", message: "Customer account successfully created", data: customer })

    } catch (error) {
        errsole.error("An error occurred while creating the customer's account", error)
        return res.send({ status: "failed", message: "An error occcurred while creating the customer's account" })
    }
}
exports.createBooking = async function(req, res){
    let requestDetails = req.body;
    try {
        const booking = await Booking.create(requestDetails);
        await booking.save()
        return res.send({ status: "success", message: "Booking created successfully", data: booking })
    } catch (error) {
        errsole.error("An error occurred while booking the service", error);
        return res.send({ status: "failed", message: "An error occurred while booking the service" })
    }
}

exports.viewProfile = async function (req, res) {
    let { customerId } = req.body;
    try {
        const profile = await Customer.findById(customerId);
        if (!profile) {
            return res.send({ status: "failed", message: "No customer found with id" })
        }
        return res.send({ status: "success", message: "Customer profile successfully retrieved", data: profile })

    } catch (error) {
        errsole.error("An error occurred while retrieving the customer profile", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the customer profile" })
    }
}

exports.viewBooking = async function(req, res){
    let {bookingId, customerId} = req.body;
    try {
        const booking = await Booking.findOne({customer: customerId, bookingId:bookingId});
        return res.send({ status: "success", message: "Customer booking successfully retrieved", data: booking })

    } catch (error) {
        errsole.error("An error occurred while retrieving the customer booking", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the customer booking" })
    }
}

exports.viewAllBooking = async function (req, res) {
    let { customerId } = req.body;
    try {
        const bookings = await Booking.find({ customer: customerId });
        return res.send({ status: "success", message: "Customer bookings successfully retrieved", data: bookings })

    } catch (error) {
        errsole.error("An error occurred while retrieving the customer bookings", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the customer bookings" })
    }
}

exports.editProfile = async function (req, res) {
    let { customerId, updateDetails } = req.body;
    try {
        const profile = await Customer.findOneAndUpdate({ _id: customerId }, updateDetails, {new: true});
        return res.send({ status: "success", message: "Customer profile successfully updated", data: profile })
    } catch (error) {
        errsole.error("An error occurred while updating the customer profile", error);
        return res.send({ status: "failed", message: "An error occurred while updating the customer profile" })
    }
}