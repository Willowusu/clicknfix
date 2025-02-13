const jwt = require("jsonwebtoken");
const User = require("./models/user.model"); // Ensure the User model is correctly imported
const dotenv = require('dotenv')
// Determine environment (default to development)
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
const secretKey = process.env.JWT_SECRET;

module.exports = {
  // ✅ Authenticate user
  authorizeAccess: (req, res, next) => {
    let token;

    // 🔹  check if  Authorization header exists

    if (!req.headers.authorization){
      return res.status(401).json({ msg: "Authorization header required." });
    }

    // 🔹 First check if token exists in the Authorization header
      token = req.headers.authorization.split(" ")[1];


    // 🔹 If no token, return error
    if (!token) {
      return res.status(401).json({ msg: "Access denied. Token is required." });
    }

    // 🔹 Verify token
    try {
      const decoded = jwt.verify(token, secretKey);
      console.log(decoded)
      req.userInfo = decoded; // Attach user info to request object
      return next();
    } catch (err) {
      console.log(err)
      return res.status(401).json({ msg: "Invalid token" });
    }
  },

  // ✅ Authorize user role
  checkRole: (roles) => async (req, res, next) => {
    try {
      const user = await User.findById(req.userInfo._id); // Get user by decoded token ID

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ msg: "Access denied. You do not have permission for this route." });
      }

      return next(); // User has the required role, proceed
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  },
};
