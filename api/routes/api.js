const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const branchController = require('../controllers/branchController');
const clientController = require('../controllers/clientController');
const clientAdminController = require('../controllers/clientAdminController');
const organisationController = require('../controllers/organisationController');
const organisationTypeController = require('../controllers/organisationTypeController');
const paymentController = require('../controllers/paymentController');
const providerController = require('../controllers/providerController');
const serviceController = require('../controllers/serviceController');
const userController = require('../controllers/userController');
const servicemanController = require('../controllers/servicemanController');
const subscriptionController = require('../controllers/subscriptionController');
const whiteLabelSettingsController = require('../controllers/whiteLabelSettingsController');

/*************************AUTHENTICATION********************************/
router.post('/login', authController.loginUser)

/*************************BOOKING ACTIONS CRUD********************************/ 
router.post('/booking', bookingController.createBooking);
router.get('/booking', bookingController.getBooking);
router.put('/booking/:id', bookingController.updateBooking);
router.delete('/booking/:id', bookingController.deleteBooking);

/*************************BRANCH ACTIONS CRUD********************************/ 
router.post('/branch', branchController.createBranch);
router.get('/branch', branchController.getBranch);
router.put('/branch/:id', branchController.updateBranch);
router.delete('/branch/:id', branchController.deleteBranch);

/*************************CLIENT ACTIONS CRUD********************************/ 
router.post('/client', clientController.createClient);
router.get('/client', clientController.getClient);
router.put('/client/:id', clientController.updateClient);
router.delete('/client/:id', clientController.deleteClient);

/*************************CLIENT ADMIN ACTIONS CRUD********************************/ 
router.post('/client-admin', clientAdminController.createClientAdmin);
router.get('/client-admin', clientAdminController.getClientAdmin);
router.put('/client-admin/:id', clientAdminController.updateClientAdmin);
router.delete('/client-admin/:id', clientAdminController.deleteClientAdmin);

/*************************ORGANISATION ACTIONS CRUD********************************/ 
router.post('/organisation', organisationController.createOrganisation);
router.get('/organisation', organisationController.getOrganisation);
router.put('/organisation/:id', organisationController.updateOrganisation);
router.delete('/organisation/:id', organisationController.deleteOrganisation);

/*************************ORGANISATION TYPE ACTIONS CRUD********************************/ 
router.post('/organisation-type', organisationTypeController.createOrganisationType);
router.get('/organisation-type', organisationTypeController.getOrganisationType);
router.put('/organisation-type/:id', organisationTypeController.updateOrganisationType);
router.delete('/organisation-type/:id', organisationTypeController.deleteOrganisationType);

/*************************PAYMENT TYPE ACTIONS CRUD********************************/ 
router.post('/payment', paymentController.createPayment);
router.get('/payment', paymentController.getPayment);
router.put('/payment/:id', paymentController.updatPayment);
router.delete('/payment/:id', paymentController.deletePayment);

/*************************PROVIDER ACTIONS CRUD********************************/ 
router.post('/provider', providerController.createPayment);
router.get('/provider', providerController.getPayment);
router.put('/provider/:id', providerController.updatPayment);
router.delete('/provider/:id', providerController.deletePayment);

/*************************PROVIDER ACTIONS CRUD********************************/ 
router.post('/service', serviceController.createService);
router.get('/service', serviceController.getService);
router.put('/service/:id', serviceController.updateService);
router.delete('/service/:id', serviceController.deleteService);

/*************************USER ACTIONS CRUD********************************/ 
router.post('/user', userController.createUser);
router.get('/user', userController.getUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

/*************************SERVICEMAN ACTIONS CRUD********************************/ 
router.post('/serviceman', servicemanController.createServiceman);
router.get('/serviceman', servicemanController.getServiceman);
router.put('/serviceman/:id', servicemanController.updateServiceman);
router.delete('/serviceman/:id', servicemanController.deleteServiceman);

/*************************SUBSCRIPTION ACTIONS CRUD********************************/ 
router.post('/subscription', subscriptionController.createSubscription);
router.get('/subscription', subscriptionController.getSubscription);
router.put('/subscription/:id', subscriptionController.updateSubscription);
router.delete('/subscription/:id', subscriptionController.deleteSubscription);

/*************************SUBSCRIPTION ACTIONS CRUD********************************/ 
router.post('/white-label-settings', whiteLabelSettingsController.createWhiteLabelSettings);
router.get('/white-label-settings', whiteLabelSettingsController.getWhiteLabelSettings);
router.put('/white-label-settings/:id', whiteLabelSettingsController.updateWhiteLabelSettings);
router.delete('/white-label-settings/:id', whiteLabelSettingsController.deleteWhiteLabelSettings);