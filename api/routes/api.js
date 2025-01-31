const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const providerController = require('../controllers/providerController');
const customerController = require('../controllers/customerController');
const subscriptionPaymentController = require('../controllers/subscriptionPaymentController');

/*************************AUTHENTICATION & USER MANAGEMENT********************************/ 
//Register customer, serviceman, provider
router.post('/register', authController.registerUser)

//Token-based authentication
router.post('/login', authController.loginUser)


/*************************SERVICE PROVIDER ACTIONS********************************/
//Create a new service
router.post('/provider/create-service', providerController.createService)

//View all services
router.get('/provider/services', providerController.viewServices)

//Assign a serviceman
router.post('/provider/assign-serviceman', providerController.assignServiceman)

//Get all bookings
router.get('/provider/bookings', providerController.viewBookings)

/*************************CUSTOMER ACTIONS********************************/
//Book service
router.post('/book-service', customerController.bookService)

//Get all bookings
router.get('/bookings', customerController.viewBookings)

/*************************SUBSCRIPTION & PAYMENT********************************/
//Subscribe 
router.post('/subscribe', subscriptionPaymentController.subscribeToPlan)

//Get subscription details
router.get('/subscription-details', subscriptionPaymentController.subscriptionDetails)

//Return webhook
router.post('/payment/webhook', subscriptionPaymentController.paymentWebhook)


module.exports = router