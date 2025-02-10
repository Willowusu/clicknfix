const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const providerController = require('../controllers/providerController');
const clientController = require('../controllers/clientController');
const subscriptionPaymentController = require('../controllers/subscriptionPaymentController');
const bookingController = require('../controllers/bookingController');
const organisationController = require('../controllers/organisationController');

/*************************AUTHENTICATION & USER MANAGEMENT********************************/ 
//Register customer, serviceman, provider
router.post('/register', authController.registerUser)

//Token-based authentication
router.post('/login', authController.loginUser)


/*************************SERVICE PROVIDER ACTIONS********************************/
//Create a new service
router.post('/provider/create-service', providerController.createService);

//View all services
router.get('/provider/services', providerController.viewServices);

//Assign a serviceman
router.post('/provider/assign-serviceman', providerController.assignServiceman);

//Get all bookings
router.get('/provider/bookings', providerController.viewBookings);


/*************************BOOKING ACTIONS********************************/
//Book service
router.post('/book-service', bookingController.bookService)

//Get all bookings
router.put('/update/:bookingId', bookingController.updateBookingStatus)

/*************************SUBSCRIPTION & PAYMENT********************************/
//Subscribe 
router.post('/subscribe', subscriptionPaymentController.subscribeToPlan)

//Get subscription details
router.get('/subscription-details', subscriptionPaymentController.subscriptionDetails)

//Return webhook
router.post('/payment/webhook', subscriptionPaymentController.paymentWebhook)

/*************************CLIENT ACTIONS********************************/
// Self-registration with Organisation & Branch selection
router.post('/client/register', clientController.register)

/*************************ORGANISATION ACTIONS********************************/
//Create organisation type
router.post('/create-organisation-type', organisationController.createOrganisationType)

//Create organisation
router.post('/create-organisation', organisationController.createOrganisation)

//Create organisation branch
router.post('/create-organisation-branch', organisationController.createOrganisationBranch)

//List oraganisations
router.get('/oraganisations', organisationController.listOrganisations)

/*************************ADMIN ACTIONS********************************/

//Add client
router.post('/admin/add-client', adminController.addClient)

//Send request for a client
router.post('/admin/request-service', adminController.requestService)


module.exports = router;