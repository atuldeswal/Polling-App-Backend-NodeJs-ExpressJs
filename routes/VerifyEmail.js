const express   = require("express");
const verifyUserEmail = require("../controllers/EmailVerifyController");
const router = express.Router();


router.route('/:token')
    .get(verifyUserEmail)

module.exports = router;