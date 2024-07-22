const express = require("express");
const router = express.Router();

const authController = require("../controllers/AuthController");
const {checkToken} = require("../utils/middlewares-checker");

router.get("/", authController.index);
router.get("/admin", checkToken, authController.checkIsAdmin);
router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);

module.exports = router;
