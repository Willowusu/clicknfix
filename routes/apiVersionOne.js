var express = require('express');
const authController = require('../api/controllers/auth.controller');
const customerController = require('../api/controllers/customer.controller');
const providerController = require('../api/controllers/provider.controller');
const servicemanController = require('../api/controllers/serviceman.controller');
const { requireAuth } = require('../api/middlewares/authenticate.middleware');
var router = express.Router();


/****************AUTH***********************/
/* Log user in. */
router.post('/login', authController.login);


/****************CUSTOMER***********************/
/* Register customer. */
router.post('/customer/register', customerController.createAccount);
/* customer creates booking. */
router.post('/customer/booking/create', requireAuth, customerController.createBooking);
/* Customer views profile. */
router.post('/customer/profile/view', customerController.viewProfile);
/* Customer edit profile. */
router.post('/customer/profile/edit', customerController.editProfile);
/* Customer views booking. */
router.post('/customer/booking/view', customerController.viewBooking);
/* Customer views all bookings. */
router.post('/customer/booking/view/all', customerController.viewAllBooking);


/****************PROVIDER***********************/
/* Register provider. */
router.post('/provider/register', providerController.createAccount);
/* Provider registers serviceman. */
router.post('/provider/serviceman/register', providerController.createServicemanAccount);
/* Provider creates service. */
router.post('/provider/service/create', providerController.createService);
/* Provider views profile. */
router.post('/provider/profile/view', providerController.viewProfile);
/* Provider edits profile. */
router.post('/provider/profile/edit', providerController.editProfile);
/* Provider views serviceman profile. */
router.post('/provider/serviceman/profile/view', providerController.viewServicemanProfile);
/* Provider edits serviceman profile. */
router.post('/provider/serviceman/profile/edit', providerController.editServicemanProfile);
/* Provider views all serviceman. */
router.post('/provider/serviceman/profile/view/all', providerController.viewAllServicemanProfile);
/* Provider views service. */
router.post('/provider/service/view', providerController.viewService);
/* Customer views all service. */
router.post('/provider/service/view/all', providerController.viewAllService);


/****************SERVICEMAN***********************/
/* Customer views all bookings. */
router.post('/serviceman/profile/view', servicemanController.viewProfile);
/* Customer views all bookings. */
router.post('/serviceman/profile/edit', servicemanController.editProfile);
/* Customer views all bookings. */
router.post('/serviceman/booking/view', servicemanController.viewBooking);
/* Customer views all bookings. */
router.post('/serviceman/booking/view/all', servicemanController.viewAllBooking);


module.exports = router;