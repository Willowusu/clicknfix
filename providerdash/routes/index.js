var express = require('express');
const { authorizeAccess } = require('../middleware/auth');
var router = express.Router();

/* GET home page. */
router.get('/', authorizeAccess, function(req, res, next) {
  res.render('index', { title: 'Dashboard', layout: './layouts/sidebar' });
});

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', layout: './layouts/auth' });
});


/*************************************BOOKINGS****************************************************/
/* GET create booking page. */
router.get('/create-booking', function(req, res, next) {
  res.render('create-booking', { title: 'Create Booking', layout: './layouts/sidebar' });
});

/* GET manage bookings page. */
router.get('/manage-bookings', authorizeAccess, function(req, res, next) {
  res.render('manage-bookings', { title: 'Manage Bookings', layout: './layouts/sidebar' });
});

/*************************************BRANCHES****************************************************/
/* GET create branches page. */
router.get('/create-branch', function(req, res, next) {
  res.render('create-branch', { title: 'Create Branches', layout: './layouts/sidebar' });
});

/* GET manage branches page. */
router.get('/manage-branches', function(req, res, next) {
  res.render('manage-branches', { title: 'Manage Branches', layout: './layouts/sidebar' });
});

/*************************************CLIENTS****************************************************/
/* GET create clients page. */
router.get('/create-client', function(req, res, next) {
  res.render('create-client', { title: 'Create Client', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/manage-clients', function(req, res, next) {
  res.render('manage-clients', { title: 'Manage Clients', layout: './layouts/sidebar' });
});

/*************************************CLIENT ADMINS****************************************************/
/* GET create clients page. */
router.get('/create-client-admin', function(req, res, next) {
  res.render('create-client-admin', { title: 'Create Client Admin', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/manage-client-admins', function(req, res, next) {
  res.render('manage-client-admins', { title: 'Manage Client Admins', layout: './layouts/sidebar' });
});

/*************************************ORGANIZATIONS****************************************************/
/* GET create clients page. */
router.get('/create-organization', function(req, res, next) {
  res.render('create-organization', { title: 'Create Organization', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/manage-organizations', function(req, res, next) {
  res.render('manage-organizations', { title: 'Manage Organizations', layout: './layouts/sidebar' });
});

/* GET view organization types page. */
router.get('/manage-organization-types', function(req, res, next) {
  res.render('manage-organization-types', { title: 'Manage Organization Types', layout: './layouts/sidebar' });
});

/*************************************PAYMENTS AND TRANSACTIONS****************************************************/
/* GET create clients page. */
router.get('/payment-transactions', function(req, res, next) {
  res.render('payment-transactions', { title: 'Payment Transactions', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/subscription-plans', function(req, res, next) {
  res.render('subscription-plans', { title: 'Subscription Plans', layout: './layouts/sidebar' });
});

/*************************************SERVICES****************************************************/
/* GET create clients page. */
router.get('/create-service', function(req, res, next) {
  res.render('create-service', { title: 'Create Service', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/manage-services', function(req, res, next) {
  res.render('manage-services', { title: 'Manage Services', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/service-categories', function(req, res, next) {
  res.render('service-categories', { title: 'Service Categories', layout: './layouts/sidebar' });
});

/*************************************SERVICEMEN****************************************************/
/* GET create clients page. */
router.get('/create-serviceman', function(req, res, next) {
  res.render('create-serviceman', { title: 'Create Serviceman', layout: './layouts/sidebar' });
});

/* GET view bookings page. */
router.get('/manage-servicemen', function(req, res, next) {
  res.render('manage-servicemen', { title: 'Manage Servicemen', layout: './layouts/sidebar' });
});

/*************************************WHITE LABEL SETTINGS****************************************************/
/* GET create clients page. */
router.get('/white-label-settings', function(req, res, next) {
  res.render('white-label-settings', { title: 'Branding and Customization', layout: './layouts/sidebar' });
});






module.exports = router;
