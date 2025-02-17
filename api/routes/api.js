const express = require('express');
const router = express.Router();

const {authorizeAccess, checkRole} = require('../middleware')

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
router.post('/login', authController.loginUser); // No auth required

/*************************BOOKING ACTIONS CRUD********************************/
router.post('/booking', authorizeAccess, checkRole(["client", "client_admin"]), bookingController.createBooking);
router.get('/booking', authorizeAccess, bookingController.getBooking);
router.put('/booking/:id', authorizeAccess, checkRole(["client_admin", "super_admin"]), bookingController.updateBooking);
router.delete('/booking/:id', authorizeAccess, checkRole(["super_admin"]), bookingController.deleteBooking);

/*************************BRANCH ACTIONS CRUD********************************/
router.post('/branch', authorizeAccess, checkRole(["provider", "super_admin"]), branchController.createBranch);
router.get('/branch', authorizeAccess, branchController.getBranch);
router.put('/branch/:id', authorizeAccess, checkRole(["super_admin"]), branchController.updateBranch);
router.delete('/branch/:id', authorizeAccess, checkRole(["super_admin"]), branchController.deleteBranch);

/*************************CLIENT ACTIONS CRUD********************************/
router.post('/client', authorizeAccess, checkRole(["client_admin", "super_admin"]), clientController.createClient);
router.get('/client', authorizeAccess, clientController.getClient);
router.put('/client/:id', authorizeAccess, checkRole(["client_admin", "super_admin"]), clientController.updateClient);
router.delete('/client/:id', authorizeAccess, checkRole(["super_admin"]), clientController.deleteClient);

/*************************CLIENT ADMIN ACTIONS CRUD********************************/
router.post('/client-admin', authorizeAccess, checkRole(["provider", "super_admin"]), clientAdminController.createClientAdmin);
router.get('/client-admin', authorizeAccess, clientAdminController.getClientAdmin);
router.put('/client-admin/:id', authorizeAccess, checkRole(["super_admin"]), clientAdminController.updateClientAdmin);
router.delete('/client-admin/:id', authorizeAccess, checkRole(["super_admin"]), clientAdminController.deleteClientAdmin);

/*************************ORGANISATION ACTIONS CRUD********************************/
router.post('/organisation', authorizeAccess, checkRole(["provider", "super_admin"]), organisationController.createOrganisation);
router.get('/organisation', authorizeAccess, organisationController.getOrganisation);
router.put('/organisation/:id', authorizeAccess, checkRole(["provider", "super_admin"]), organisationController.updateOrganisation);
router.delete('/organisation/:id', authorizeAccess, checkRole(["provider", "super_admin"]), organisationController.deleteOrganisation);

/*************************ORGANISATION TYPE ACTIONS CRUD********************************/
router.post('/organisation-type', authorizeAccess, checkRole(["super_admin"]), organisationTypeController.createOrganisationType);
router.get('/organisation-type', authorizeAccess, organisationTypeController.getOrganisationType);
router.put('/organisation-type/:id', authorizeAccess, checkRole(["super_admin"]), organisationTypeController.updateOrganisationType);
router.delete('/organisation-type/:id', authorizeAccess, checkRole(["super_admin"]), organisationTypeController.deleteOrganisationType);

/*************************PAYMENT ACTIONS CRUD********************************/
router.post('/payment', authorizeAccess, checkRole(["provider", "super_admin"]), paymentController.createPayment);
router.get('/payment', authorizeAccess, checkRole(["provider", "super_admin"]), paymentController.getPayment);
router.put('/payment/:id', authorizeAccess, checkRole(["super_admin"]), paymentController.updatePayment);
router.delete('/payment/:id', authorizeAccess, checkRole(["super_admin"]), paymentController.deletePayment);

/*************************PROVIDER ACTIONS CRUD********************************/
router.post('/provider', authorizeAccess, checkRole(["provider", "super_admin"]), providerController.createProvider);
router.get('/provider', authorizeAccess, checkRole(["super_admin"]), providerController.getProvider);
router.put('/provider/:id', authorizeAccess, checkRole(["super_admin"]), providerController.updateProvider);
router.delete('/provider/:id', authorizeAccess, checkRole(["super_admin"]), providerController.deleteProvider);

/*************************SERVICE ACTIONS CRUD********************************/
router.post('/service', authorizeAccess, checkRole(["provider", "super_admin"]), serviceController.createService);
router.get('/service', authorizeAccess, serviceController.getService);
router.put('/service/:id', authorizeAccess, checkRole(["provider", "super_admin"]), serviceController.updateService);
router.delete('/service/:id', authorizeAccess, checkRole(["super_admin"]), serviceController.deleteService);

/*************************USER ACTIONS CRUD********************************/
router.post('/user', userController.createUser);
router.get('/user', authorizeAccess, checkRole(["super_admin"]), userController.getUser);
router.put('/user/:id', authorizeAccess, checkRole(["super_admin"]), userController.updateUser);
router.delete('/user/:id', authorizeAccess, checkRole(["super_admin"]), userController.deleteUser);

/*************************SERVICEMAN ACTIONS CRUD********************************/
router.post('/serviceman', authorizeAccess, checkRole(["provider", "super_admin"]), servicemanController.createServiceman);
router.get('/serviceman', authorizeAccess, servicemanController.getServiceman);
router.put('/serviceman/:id', authorizeAccess, checkRole(["provider", "super_admin"]), servicemanController.updateServiceman);
router.delete('/serviceman/:id', authorizeAccess, checkRole(["super_admin"]), servicemanController.deleteServiceman);

/*************************SUBSCRIPTION ACTIONS CRUD********************************/
router.post('/subscription', authorizeAccess, checkRole(["super_admin"]), subscriptionController.createSubscription);
router.get('/subscription', authorizeAccess, subscriptionController.getSubscription);
router.put('/subscription/:id', authorizeAccess, checkRole(["super_admin"]), subscriptionController.updateSubscription);
router.delete('/subscription/:id', authorizeAccess, checkRole(["super_admin"]), subscriptionController.deleteSubscription);

/*************************WHITE LABEL SETTINGS ACTIONS CRUD********************************/
router.post('/white-label-settings', authorizeAccess, checkRole(["provider", "super_admin"]), whiteLabelSettingsController.createWhiteLabelSettings);
router.get('/white-label-settings', authorizeAccess, whiteLabelSettingsController.getWhiteLabelSettings);
router.put('/white-label-settings/:id', authorizeAccess, checkRole(["super_admin"]), whiteLabelSettingsController.updateWhiteLabelSettings);
router.delete('/white-label-settings/:id', authorizeAccess, checkRole(["super_admin"]), whiteLabelSettingsController.deleteWhiteLabelSettings);

module.exports = router;

//setup for db
//create admin profile
//create subscription plans
//create organisation types

//PROVIDER
//PROVIDER CREATES ACCOUNT WITH EMAIL AND PASSWORD
//PROVIDER SELECTS A SUBSCRIPTION PLAN
//IF IT INVOLVES BRANDING THEY GO AHEAD AND SETUP THEIR WHITE LABEL SETTINGS
//PROVIDER COMPLETES REGISTRATION BY PROVIDING OTHER DETAILS TOO
//PROVIDER ADDS THE ORGANISATION AND CATEGORISES THEM ACCORDING TO THE TYPES
//PROVIDER ADDS CLIENT ADMINS

//PROVIDER CREATES SERVICEMEN(USER)
//PROVIDER COMPLETES SERVICEMEN DETAILS(SERVICEMEN)

//PROVIDER OR CLIENT ADMIN CAN THEN CREATE BRANCHES
//PROVIDER OR CLIENT ADMIN CAN THEN CREATE CLIENTS(USER)
//PROVIDER OR CLIENT CAN THEN CREATE CLIENTS(CLIENTS)

//CLIENTS OR CLIENT ADMINS CAN CREATE BOOKINGS

