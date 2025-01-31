const User = require('../models/user.model.js');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);
    try {
        const user = await User.create({ email, hashedPassword, role });
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const loginUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email, role });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json(user)
        } else {
            res.status(404).json({ msg: 'Credentials provided are incorrect' })
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { registerUser, loginUser }