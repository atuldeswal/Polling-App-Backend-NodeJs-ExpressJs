const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/User");

const loginUser = async(req, res) => {
    const {email,password} = req.body;
    console.log(password);
    if(!email || !password){
        return res.status(400).json({"error": "Invalid details"});
    }

    const savedUser = await User.findOne({email:email}).exec();
    if(!savedUser){
        return res.status(403).json({"error": "User not found"});
    }
    const passwordMatch = await bcrypt.compare(password, savedUser.password);
    if(!passwordMatch){
        return res.status(401).json({"error": "Invalid password"});
    }

    if(!savedUser.isVerified){
        return res.status(401).json({"error": "please verify your email first"});
    }
    //JWT area
    const accessToken = jwt.sign(
        {
            "username" : savedUser.username,
            "email" : savedUser.email,
            "_id" : savedUser._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '15m'}
    );
    const refreshToken = jwt.sign(
        {"email" : savedUser.email},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
    );
    
    savedUser.refreshToken = refreshToken;
    const result = await savedUser.save();

    res.cookie('jwt', refreshToken, {httpOnly: true,sameSite: 'None',secure: true, maxAge: 24 * 60 * 60 * 1000});
    res.status(200).json({"accessToken": accessToken});
}

module.exports = loginUser;
