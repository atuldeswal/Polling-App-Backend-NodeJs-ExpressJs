const jwt = require("jsonwebtoken");
const User = require("../models/User");

const refreshToken = async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.jwt){
        return res.status(401).json({"error": "no cookie or jwt found"});
    }

    const refreshToken = cookie.jwt;
    const foundUser = await User.findOne({refreshToken}).exec(); 
    if(!foundUser){
        return res.status(403).json({"error": "User not found"});
    }
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username){
                return res.status(403).json({"error": "User not found"});
            }
            
            const accessToken = jwt.sign(
                {
                    "username": foundUser.username,
                    "email": foundUser.email,
                    "_id": foundUser._id,
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'}
            );
            
            res.json({accessToken});
        }
    );
}

module.exports = refreshToken;
