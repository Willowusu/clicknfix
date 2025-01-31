require('dotenv').config();
var express = require('express');
var router = express.Router();
let axios = require('axios');
const jwt = require('jsonwebtoken');
// eslint-disable-next-line no-undef
const secretKey = process.env.SECRET_KEY
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
  res.clearCookie("UserAuth")
  res.redirect("/login");
})

router.post('/sign-in', async function (req, res) {
  let requestDetails = req.body;

  let options = {
    method: "POST",
    url: `http://localhost:3000/api/v1/login`,
    headers: {
      "Content-Type": "application/json",
    },
    data: requestDetails
  };


  try {
    let signinResponse = await axios.request(options);

    if (signinResponse.data.status !== "success") {
      // Handle invalid credentials or other failures
      return res.send({
        status: "failed",
        message: signinResponse.data.message || "Login failed. Please check your credentials."
      });
    }
    // Generate JWT token
    const token = jwt.sign(signinResponse.data.data, secretKey, { expiresIn: '1h' });
    res.clearCookie("UserAuth")
    res.cookie("UserAuth", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
    //store customer data in localstorage
    return res.send({
      status: "success",
      message: signinResponse.data.message,
      userType: signinResponse.data.userType });
  } catch (error) {
    errsole.error(
      "An error occurred while logging in the user: ",
      error
    );

    return res.send({
      code: 500,
      status: "failed",
      message: "An error occurred while logging in the user",
      data: error
    });
  }
});


module.exports = router;
