var express = require('express');
var router = express.Router();
const { requireAuth } = require('../api/middlewares/authenticate.middleware');
 

/* GET provider dashboard. */
router.get('/dashboard', requireAuth, function(req, res) {
  let userDetails = req.session.user
  res.render('provider/dashboard', {title: "Dashboard", userDetails: userDetails, layout: './layouts/provider'});
});

/* GET provider dashboard. */
router.get('/wallet', function (req, res) {
  res.render('provider/wallet', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/commission-history', function (req, res) {
  res.render('provider/commissionHistory', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/withdraw-request', function (req, res) {
  res.render('provider/withdrawRequest', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/serviceman/all', function (req, res) {
  res.render('provider/servicemen', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/serviceman/create', function (req, res) {
  res.render('provider/createServicemen', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/serviceman/withdraw-request', function (req, res) {
  res.render('provider/servicemenWithdrawRequest', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/serviceman/locations', function (req, res) {
  res.render('provider/servicemenLocations', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/services/all', function (req, res) {
  res.render('provider/services', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/services/create', function (req, res) {
  res.render('provider/createService', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/services/add-on', function (req, res) {
  res.render('provider/addonService', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/services/packages', function (req, res) {
  res.render('provider/servicePackages', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/custom-jobs', function (req, res) {
  res.render('provider/customJobs', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/bookings', function (req, res) {
  res.render('provider/bookings', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/reviews/service', function (req, res) {
  res.render('provider/serviceReview', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/reviews/serviceman', function (req, res) {
  res.render('provider/servicemanReview', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/plans/all', function (req, res) {
  res.render('provider/plans', { title: "Dashboard", layout: './layouts/provider' });
});

/* GET provider dashboard. */
router.get('/plans/subscriptions', function (req, res) {
  res.render('provider/subscriptionPlans', { title: "Dashboard", layout: './layouts/provider' });
});

module.exports = router;
