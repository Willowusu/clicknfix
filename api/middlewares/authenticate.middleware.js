exports.requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next(); // User is authenticated, continue to next middleware
    } else {
        return res.send({status: "failed", message: "User has been logged out.", data: "logged_out"}); // User is not authenticated, redirect to login page
    }
}