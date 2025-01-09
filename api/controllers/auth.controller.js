const Customer = require('../models/customer.model');
const Provider = require('../models/provider.model');
const Serviceman = require('../models/serviceman.model');
const errsole = require('errsole');
const bcrypt = require('bcrypt');

exports.login = async function(req, res){
    //TODO: check if details are available
    let requestDetails = req.body;
    let customerInfo, providerInfo, servicemanInfo;

   
    try {
        if (requestDetails.userType == 'customer'){
            customerInfo = await Customer.findOne({email: requestDetails.email});
            if (customerInfo && (await bcrypt.compare(requestDetails.password, customerInfo.password))) {
                req.session.userId = customerInfo._id; // Set session identifier
                return res.send({ status: "success", message: "Customer logged in successfully", data: customerInfo });
            } 
            return res.send({ status: "failed", message: "Invalid credentails" })
        } else if (requestDetails.userType == 'provider') {
            providerInfo = await Provider.findOne({ email: requestDetails.email });
            if (providerInfo && (await bcrypt.compare(requestDetails.password, providerInfo.password))) {
                req.session.userId = providerInfo._id; // Set session identifier
                return res.send({ status: "success", message: "Provider logged in successfully", data: providerInfo });
            }
            return res.send({ status: "failed", message: "Invalid credentails" })
        } else if (requestDetails.userType == 'serviceman') {
            servicemanInfo = await Serviceman.findOne({ email: requestDetails.email });
            if (servicemanInfo && (await bcrypt.compare(requestDetails.password, servicemanInfo.password))) {
                req.session.userId = servicemanInfo._id; // Set session identifier
                return res.send({ status: "success", message: "Serviceman logged in successfully", data: servicemanInfo });
            }
            return res.send({ status: "failed", message: "Invalid credentails" })
        } else{
            return res.send({ status: "failed", message: "There is an error with the provided request details" })
        }

    } catch (error) {
        errsole.error("An error occurred while creating the customer's account", error)
        return res.send({ status: "failed", message: "An error occcurred while creating the customer's account" })
    }
}
