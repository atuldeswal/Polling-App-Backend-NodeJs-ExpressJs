const bcrypt = require("bcrypt");
const sendEmail = require("../utils/EmailVerify");
const crypto = require("crypto");
const User = require("../models/User");
require("dotenv").config();

const handleSignUp = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send("Invalid details");
    }

    const duplicateUser = await User.findOne({ email: email }).exec();

    if (duplicateUser) {
        return res.status(409).send({ "error": "User already exists" });
    }

    try {
        const hashPassWord = await bcrypt.hash(password, 10);
        const verficationToken = crypto.randomBytes(32).toString("hex");
        const url = `${process.env.BASE_URL}verify/${verficationToken}`;
        const text = `Click the link below to verify your account\n${url}`;

        const result = await User.create({
            "username": username,
            "email": email,
            "password": hashPassWord,
            "verificationToken": verficationToken
        });

        await sendEmail(email, "Email Verification", text);

        return res.status(201).json({ "message": "please verify your email" });
    } catch (error) {
        return res.status(500).json({ "error": "Server Error" });
    }
}

module.exports = handleSignUp;
