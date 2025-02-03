require("dotenv").config();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const https = require("https");
const instance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});
const { Buffer } = require("buffer");

const baseUrl = process.env.BASE_URL;
const secretKey = process.env.SECRET_KEY;
const tenantDomain = "test.3ribe.io";

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // TTL set to 60 minutes (3600 seconds)

async function getFile(tenantID, file) {
  let imagePrepend = "data:image/png;base64,";
  let tenantSettingsOptions = {
    method: "get",
    url: `${baseUrl}/settings/get-file/${tenantID}/${file}`,
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "arraybuffer", // Set response type to arraybuffer
  };

  try {
    let response = await instance(tenantSettingsOptions);
    let buffer = Buffer.from(response.data, "binary");

    return `${imagePrepend}${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Error fetching file:", error);
  }
}

// async function getFile(tenantID, file){

//     let tenantSettingsOptions = {
//         method: "get",
//         url: `${baseUrl}/settings/get-file/${tenantID}/${file}`,
//         headers: {
//             "Content-Type": "application/json",
//         }
//     }
//     let response = await instance(tenantSettingsOptions);
//     return response.data

// }

module.exports = {
  authorizeAccess: (req, res, next) => {
    let token;
    let cookieString = req.headers.cookie;
    if (!cookieString) {
      console.log({
        status: "failed",
        error: "Authorization token is required",
      });
      return res.redirect("/login");
    }
    let authCookieArray = cookieString.split("=");
    const adminAuthHeader = (header) => /adminauth/i.test(header);
    let authCookieArrayIndex = authCookieArray.findIndex(adminAuthHeader);

    token = authCookieArray[authCookieArrayIndex + 1];

    if (authCookieArrayIndex == undefined || authCookieArrayIndex === -1) {
      console.log({
        status: "failed",
        error: "Authorization token is required",
      });
      return res.redirect("/login");
    }
    // invalid token - synchronous
    try {
      const decoded = jwt.verify(token, secretKey);
      req.tenantUserInfo = decoded;
      return next();
    } catch (err) {
      // err
      console.log({ status: "failed", error: "Invalid token" });
      return res.redirect("/login");
    }
  },

  getTenantSettings: async (req, res, next) => {
    let requestOriginDomain = process.env.NODE_ENV == "production" ? req.headers.host : tenantDomain
    // let requestOriginDomain = tenantDomain; //tenantDomain - comment out after test
    let tenantLogo, tenantFavicon;
    // Check if the data is cached
    const cachedData = cache.get(requestOriginDomain);
    if (cachedData) {
      req.tenantSettings = cachedData;
      return next();
    }

    //make request to get tenant settings
    let tenantSettings;

    let tenantSettingsOptions = {
      method: "get",
      url: `${baseUrl}/settings/get-domain-all/${requestOriginDomain}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      let response = await instance(tenantSettingsOptions);
      tenantSettings = response.data.data;

      let tenantID = tenantSettings.id;
      let tenantPrimaryColor = tenantSettings.primary_color;

      if (requestOriginDomain === "test.3ribe.io") {
        tenantLogo =
          "https://assets-global.website-files.com/652bfe8cbf55b01d96731aec/652e242eda9971e1c3d2eba9_3ribe%20logo%201.svg";
      } else {
        tenantLogo = tenantSettings.logo;
      }
      if (requestOriginDomain === "test.3ribe.io") {
        tenantFavicon =
          "https://assets-global.website-files.com/652bfe8cbf55b01d96731aec/652e242eda9971e1c3d2eba9_3ribe%20logo%201.svg";
      } else {
        tenantFavicon = tenantSettings.favicon;
      }

      let tenantTitle = tenantSettings.title;

      req.tenantSettings = {
        tenantID: tenantID,
        tenantPrimaryColor: tenantPrimaryColor,
        tenantLogo: await getFile(tenantID, "logo"),
        tenantFavicon: await getFile(tenantID, "favicon"),
        tenantTitle: tenantTitle,
      };

      // Cache the response
      cache.set(requestOriginDomain, req.tenantSettings);
      return next();
    } catch (error) {
      console.log("An error occurred while fetching tenant settings: ", error);
      res.redirect("/login");
    }
  },
};