const express = require("express");
const router = express.Router();
const logoutUser = require("../controllers/LogOutController");

router.route('/')
    .get(logoutUser)

module.exports = router;