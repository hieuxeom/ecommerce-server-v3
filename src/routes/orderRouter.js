const express = require("express");
const router = express.Router();

const orderController = require("../controllers/OrderController");
const { checkAdminRole, checkToken } = require("../utils/middlewares-checker");

router.get("/", checkAdminRole, orderController.getAllOrders);
router.get("/:orderId", checkToken, orderController.getOrderDetails);
router.post("/", checkToken, orderController.createNewOrder);
router.put("/orders-status", checkAdminRole, orderController.updateAllOrdersStatus);
router.put("/:orderId/order-status", orderController.changeOrderStatus);
router.put("/:orderId/cancel-order", checkToken, orderController.cancelOrder);
// router.put("/:orderId/return-order", checkToken, orderController.cancelOrder)

module.exports = router;
