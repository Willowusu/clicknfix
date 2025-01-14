var express = require('express');
var router = express.Router();

/* GET provider dashboard. */
router.get('/dashboard', function (req, res) {
    res.render('serviceman/dashboard', { title: "Dashboard", layout: './layouts/serviceman' });
});


router.get('/wallet', function (req, res) {
    res.render('serviceman/wallet', { title: "Dashboard", layout: './layouts/serviceman' });
});

/* GET provider dashboard. */
router.get('/withdraw-request', function (req, res) {
    res.render('serviceman/withdrawRequest', { title: "Dashboard", layout: './layouts/serviceman' });
});

/* GET provider dashboard. */
router.get('/bookings', function (req, res) {
    res.render('serviceman/bookings', { title: "Dashboard", layout: './layouts/serviceman' });
});

module.exports = router;