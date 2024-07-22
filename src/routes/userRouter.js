const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const { checkAdminRole, checkToken } = require("../utils/middlewares-checker");

// admin
router.get("/", checkAdminRole, userController.getAllUsers);
router.put("/:userId/activation", checkAdminRole, userController.changeUserActivationStatus);

//basic user
router.get("/rftk", userController.getNewAccessToken);

router.post("/change-password", userController.changePassword);

router.post("/email-address", userController.changeEmailAddress);
router.post("/username", userController.changeUsername);

router.get("/me", checkToken, userController.getCurrentUser);
router.get("/me/orders", checkToken, userController.getUserOrders);
router.get("/:userId/orders", checkAdminRole, userController.getOrdersByUserId);

router.get("/me/address", checkToken, userController.getUserAddresses);
router.post("/me/address", checkToken, userController.createNewAddress);

router.get("/me/address/:addressId", userController.getAddressDetails);
router.put("/me/address/:addressId", userController.editAddress);
router.delete("/me/address/:addressId", userController.removeAddress);

router.get("/:userId", checkAdminRole, userController.getUserInfo);

module.exports = router;
