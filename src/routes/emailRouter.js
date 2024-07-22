const express = require("express");
const router = express.Router();

const emailController = require("../controllers/EmailController");
const {checkToken} = require("../utils/middlewares-checker");

router.post("/change-password", checkToken, emailController.sendMailChangePassword)

router.post("/change-email", checkToken, emailController.sendMailChangeEmailAddress)

module.exports = router;