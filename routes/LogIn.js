const express = require("express");
const router = express.Router();
require('dotenv').config();
const loginUser = require("../controllers/LoginController.js");

router.route('/')
    .post(loginUser);

module.exports = router;