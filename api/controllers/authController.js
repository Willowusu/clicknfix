const User = require('../models/user.model.js');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const loginUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email, role });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(response.data.data, secretKey, {
                expiresIn: "1h",
              });
              return res.status(200).json({ status: response.data.status, token: token, user });
        } else {
            res.status(404).json({ msg: 'Credentials provided are incorrect' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


module.exports = { registerUser, loginUser }