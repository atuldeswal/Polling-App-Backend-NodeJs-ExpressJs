const path = require("path");
const User = require("../models/User");

const verifyUserEmail = async(req, res)=>{
    const incomingToken = req.params.token;
    
    const verifyUser = await User.findOne({verificationToken: incomingToken}).exec();
    if(!verifyUser){
        return res.status(404).json({"message": "User not found"});
    }
    
    verifyUser.isVerified = true;
    verifyUser.verificationToken = "";
    const result = await verifyUser.save();

    res.status(200).sendFile(path.join(__dirname, "..", "public", "verify.html"));
}

module.exports = verifyUserEmail;