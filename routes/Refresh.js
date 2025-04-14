const express = require("express");
const refreshToken = require("../controllers/refreshTokenController");
const router = express.Router();

router.route('/')
    .get(refreshToken);

module.exports = router;