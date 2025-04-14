const express = require("express");
const router = express.Router();
const handleSignUp = require("../controllers/SignUpController")


router.route('/')
    .post(handleSignUp)

module.exports = router;