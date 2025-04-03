require('dotenv').config()

const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;



const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user = await User.findOne({ email, role });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(user.toJSON(), secretKey, {
        expiresIn: "2h",
      });
      delete user.password;
      delete user.__v;
      delete user.createdAt;
      delete user.updatedAt;
      return res.status(200).json({ status: "success", data: { token: token, user } });
    } else {
      res.json({ status: "failed", data: { messsage: 'Credentials provided are incorrect' } })
    }
  } catch (error) {
    res.status(400).json({ status: "failed", data: { message: error.message } })
  }
}


module.exports = { loginUser }