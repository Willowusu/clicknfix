let jwt = require("jsonwebtoken");

exports.authorizeAccess = (req, res, next) => {
    let token;
    let cookieString = req.headers.cookie;
    if (!cookieString) {
      console.log({
        status: "failed",
        error: "Auth token is required",
      });
      return res.redirect("/login");
    }
    let authCookieArray = cookieString.split("=");
    const adminAuthHeader = (header) => /adminauth/i.test(header);
    let authCookieArrayIndex = authCookieArray.findIndex(adminAuthHeader);

  token = authCookieArray[authCookieArrayIndex + 1];

  req.headers.authorization = 'Bearer' + ' ' + token;

    if (authCookieArrayIndex == undefined || authCookieArrayIndex === -1) {
      console.log({
        status: "failed",
        error: "Auth token is required",
      });
      return res.redirect("/login");
    }
    // invalid token - synchronous
    return next();
  }