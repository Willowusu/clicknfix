require('dotenv').config()
const jwt = require('jsonwebtoken');
const errsole = require('errsole')
// eslint-disable-next-line no-undef
const secretKey = process.env.SECRET_KEY;


module.exports = {
    authorizeAccess: (req, res, next) => {
        let token;
        let cookieString = req.headers.cookie;
        if (!cookieString) {
            errsole.log({ status: 'failed', error: 'Authorization token is required' });
            return res.redirect("/sign-in")
        }
        let authCookieArray = cookieString.split("=");
        const userAuthHeader = (header) => /userauth/i.test(header);
        let authCookieArrayIndex = authCookieArray.findIndex(userAuthHeader)

        token = authCookieArray[authCookieArrayIndex + 1]

        if (authCookieArrayIndex == undefined || authCookieArrayIndex === -1) {
            errsole.error({ status: 'failed', error: 'Authorization token is required' });
            return res.redirect("/sign-in")
        }
        // invalid token - synchronous
        try {
            const decoded = jwt.verify(token, secretKey);
            req.userInfo = decoded;
            return next();
        } catch (error) {
            // err
            errsole.error({ status: 'failed', error: 'Invalid token', message: error });
            return res.redirect("/sign-in")
        }
    },


}






