var express = require('express');
var router = express.Router();
let axios = require('axios');
const errsole = require('errsole');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/sign-in', function (req, res) {
  res.render('login', { title: 'Express', layout: './layouts/login'});
});


router.get('/logout', async function (req, res) {
  req.session.destroy();
  return res.redirect('/sign-in')
});


router.post('/sign-in', async function (req, res) {
  const requestDetails = req.body;

  try {
    // Forward login request to the external API
    const signinResponse = await axios.post('http://localhost:3000/api/v1/login', requestDetails);

    if (signinResponse.data.status === "success") {
      // Set session data on successful login
      req.session.userId = signinResponse.data.data._id; // ID from the returned user data
      req.session.userType = signinResponse.data.userType;
      req.session.user = signinResponse.data.data

      // Respond to the frontend
      return res.send({
        status: "success",
        message: signinResponse.data.message,
        userType: signinResponse.data.userType // e.g., 'customer', 'provider', 'serviceman'
      });
    }

    // Handle invalid credentials or other failures
    return res.send({
      status: "failed",
      message: signinResponse.data.message || "Login failed. Please check your credentials."
    });

  } catch (error) {
    errsole.error("Error during login:", error.message);

    // Respond with a generic error message
    return res.status(500).send({
      status: "failed",
      message: "An error occurred while signing in. Please try again."
    });
  }
});




module.exports = router;
