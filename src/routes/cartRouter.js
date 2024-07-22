const express = require("express");
const router = express.Router();

const cartController = require("../controllers/CartController");
const {checkToken} = require("../utils/middlewares-checker");

router.get("/", checkToken, cartController.getCurrentUserCart);
router.post("/", checkToken, cartController.addProductToCart);
router.put("/", checkToken, cartController.updateNewQuantity);
router.put("/delete", checkToken, cartController.deleteProductInCart); // need handle after handle product
router.put("/voucher", checkToken, cartController.editCartVoucher);
router.put("/update", checkToken, cartController.updateCartDetails);
router.delete("/", checkToken, cartController.removeUserCart);

module.exports = router;
