require('dotenv').config()

const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;



const loginUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email, role });
        console.log(user)
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(user.toJSON(), secretKey, {
                expiresIn: "2h",
              });
              return res.status(200).json({ status: "success", token: token, user });
        } else {
            res.status(404).json({ msg: 'Credentials provided are incorrect' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = { loginUser }