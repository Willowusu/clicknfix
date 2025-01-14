const Provider = require('../models/provider.model');
const Serviceman = require('../models/serviceman.model');
const Service = require('../models/service.model');
const { getBookingCountForProvider } = require('../helpers/getBookingCountForProvider')
const bcrypt = require('bcrypt');
const errsole = require('errsole');

exports.createAccount = async function (req, res) {
    let requestDetails = req.body;
    //TODO: call external function that validates account information
    const salt = await bcrypt.genSalt(10);
    requestDetails.password = await bcrypt.hash(requestDetails['password'], salt); //no reason for square bracket and dot notation change
    try {
        const provider = new Provider(requestDetails);
        await provider.save();
        delete provider.password;
        return res.send({ status: "success", message: "Provider account successfully created", data: provider })

    } catch (error) {
        errsole.error("An error occurred while creating the provider's account", error)
        return res.send({ status: "failed", message: "An error occcurred while creating the provider's account" })
    }
}

exports.createServicemanAccount = async function (req, res) {
    let requestDetails = req.body;
    //TODO: call external function that validates the account information
    //TODO: send the serviceman's account details via mail
    const salt = await bcrypt.genSalt(10);
    requestDetails.password = await bcrypt.hash(requestDetails['password'], salt); //no reason for square bracket and dot notation change

    try {
        const serviceman = new Serviceman(requestDetails);
        await serviceman.save();
        delete serviceman.password;
        return res.send({ status: "success", message: "Serviceman account successfully created", data: serviceman });
    } catch (error) {
        errsole.error("An error occurred while creating the serviceman's account", error);
        return res.send({ status: "failed", message: "An error occurred while creating the serviceman's account" })
    }
}

exports.createService = async function (req, res) {
    let requestDetails = req.body;
    //TODO: call external function that validates the service creation information

    try {
        const service = new Service(requestDetails);
        await service.save();
        return res.send({ status: "success", message: "Service created successfully", data: service });
    } catch (error) {
        errsole.error("An error occurred while creating the service", error);
        return res.send({ status: "failed", message: "An error occurred while creating the service" })
    }
}

exports.viewProfile = async function (req, res) {
    let { providerId } = req.body;
    try {
        const profile = await Provider.findById(providerId);
        if (!profile) {
            return res.send({ status: "failed", message: "No provider found with id" })
        }
        return res.send({ status: "success", message: "Provider profile successfully retrieved", data: profile })

    } catch (error) {
        errsole.error("An error occurred while retrieving the provider profile", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the provider profile" })
    }
}

exports.viewServicemanProfile = async function(req, res){
    let {servicemanId} = req.body;
    try{
        const profile = await Serviceman.findById(servicemanId);
        if (!profile) {
            return res.send({ status: "failed", message: "No serviceman found with id" })
        }
        return res.send({ status: "success", message: "Serviceman profile successfully retrieved", data: profile })
    } catch(error){
        errsole.error("An error occurred while retrieving the serviceman profile", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the serviceman profile"})
    }
}

exports.viewAllServicemanProfile = async function(req, res){
    try{
        const profiles = await Serviceman.find({});
        return res.send({ status: "success", message: "Servicemen profiles successfully retrieved", data: profiles})
    } catch(error){
        errsole.error("An error occurred while retrieving the servicemen profiles", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the servicemen profiles"})
    }
}

exports.viewService = async function(req, res){
    let { serviceId } = req.body;
    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.send({ status: "failed", message: "No service found with id" })
        }
        return res.send({ status: "success", message: "Service profile successfully retrieved", data: service })
    } catch (error) {
        errsole.error("An error occurred while retrieving the service", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the service" })
    }
}

exports.viewAllService = async function (req, res) {
    try {
        const services = await Service.find({});
        if (!services) {
            return res.send({ status: "failed", message: "No services found" })
        }
        return res.send({ status: "success", message: "Services successfully retrieved", data: services })
    } catch (error) {
        errsole.error("An error occurred while retrieving the services", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the services" })
    }
}

exports.editProfile = async function (req, res) {
    let { providerId, updateDetails } = req.body;
    try {
        const profile = await Provider.findOneAndUpdate({_id:providerId}, updateDetails, {new: true});
        return res.send({ status: "success", message: "Provider profile successfully updated", data: profile })
    } catch (error) {
        errsole.error("An error occurred while updating the provider profile", error);
        return res.send({ status: "failed", message: "An error occurred while updating the provider profile" })
    }
}

exports.editServicemanProfile = async function (req, res) {
    let { servicemanId, updateDetails } = req.body;
    try {
        const profile = await Serviceman.findOneAndUpdate({_id:servicemanId}, updateDetails, {new: true});
        return res.send({ status: "success", message: "Serviceman profile successfully updated", data: profile })
    } catch (error) {
        errsole.error("An error occurred while updating the serviceman profile", error);
        return res.send({ status: "failed", message: "An error occurred while updating the serviceman profile" })
    }
}

exports.editService = async function (req, res) {
    let { serviceId, updateDetails } = req.body;
    try {
        const service = await Service.findOneAndUpdate({ _id: serviceId }, updateDetails, {new:true});
        return res.send({ status: "success", message: "Service successfully updated", data: service })
    } catch (error) {
        errsole.error("An error occurred while updating the service profile", error);
        return res.send({ status: "failed", message: "An error occurred while updating the service" })
    }
}

exports.dashboardTopInformation = async function(req, res){
    let requestDetails = req.body
    let totalRevenue, totalServicemen, totalServices, totalBookings, totalBalance;
    try{
        totalServicemen = await Serviceman.countDocuments({ provider: requestDetails.providerId});
        totalServices = await Service.countDocuments({ provider: requestDetails.providerId});
        totalBookings = await getBookingCountForProvider(requestDetails.providerId);
        totalRevenue = 0;
        totalBalance = 0
    } catch(error){
        errsole.error("An error occurred while retrieving the dashboard information", error);
        return res.send({ status: "failed", message: "An error occurred while retrieving the dashboard information"})
    }

    return { totalRevenue, totalServicemen, totalServices, totalBookings, totalBalance }

}

exports.dashboardRevenueChart = async function(req, res){

}

exports.dashboardTables = async function(req, res){
    
}




