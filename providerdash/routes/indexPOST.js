var express = require('express');
var router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { apiService } = require('../services/apiService');
const { authorizeAccess } = require('../middleware/auth');


router.post(
  "/login",
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/auth/login', 'POST', reqDetails);

      if (response.status !== "success") {
        return res.send(response)
      }

      res.clearCookie("AdminAuth");
      // res.clearCookie("Info");

      res.cookie("AdminAuth", response.data.token, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true,
      });

      // res.cookie("Info", JSON.stringify(response.data.user), {
      //   maxAge: 2 * 60 * 60 * 1000,
      //   httpOnly: true,
      // });

      return res.status(200).send({ status: response.status, data: { message: "User logged in successfully" } });
    } catch (error) {
      console.log(
        "An error occurred while logging in: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while logging in",
        }
      });
    }
  }
);

router.get(
  "/bookings",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/booking', 'GET', reqDetails, {Authorization: req.headers.authorization});

      if (response.status !== "success") {
        return res.send(response)
      }


      return res.status(200).send({ status: response.status, data: { bookings: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all bookings: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all bookings",
        }
      });
    }
  }
);

router.get(
  "/branches",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/branches', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }


      return res.status(200).send({ status: response.status, data: { branches: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all branches: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all branches",
        }
      });
    }
  }
);

router.get(
  "/clients",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/clients', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }

      return res.status(200).send({ status: response.status, data: { clients: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all clients: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all clients",
        }
      });
    }
  }
);

router.get(
  "/client-admins",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/client-admins', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }

      return res.status(200).send({ status: response.status, data: { client_admins: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all client admins: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all client admins",
        }
      });
    }
  }
);

router.get(
  "/organizations",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/organizations', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }



      return res.status(200).send({ status: response.status, data: { organizations: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all organizations: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all organizations",
        }
      });
    }
  }
);

router.get(
  "/services",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/services', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }



      return res.status(200).send({ status: response.status, data: { services: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all services: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all services",
        }
      });
    }
  }
);

router.get(
  "/service-categories",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/service-categories', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }



      return res.status(200).send({ status: response.status, data: { service_categories: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all service categories: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all service categories",
        }
      });
    }
  }
);

router.get(
  "/servicemen",
  authorizeAccess,
  async function (req, res, next) {
    let reqDetails = req.body;
    try {
      let response = await apiService('/provider/servicemen', 'GET', reqDetails, { Authorization: req.headers.authorization });

      if (response.status !== "success") {
        return res.send(response)
      }



      return res.status(200).send({ status: response.status, data: { servicemen: response.data } });
    } catch (error) {
      console.log(
        "An error occurred while fetching all servicemen: ",
        error
      );
      return res.send({
        status: "failed",
        data: {
          message: "An error occurred while fetching all servicmen",
        }
      });
    }
  }
);







module.exports = router;