const express = require("express");
const router = express.Router();

const voucherController = require("../controllers/VoucherController");
const { checkAdminRole } = require("../utils/middlewares-checker");

router.get("/:voucherId", voucherController.getVoucherById);
router.get("/", voucherController.getAllVouchers);
router.post("/", checkAdminRole, voucherController.createNewVoucher);
router.put("/:voucherId/activation", checkAdminRole, voucherController.changeVoucherActivationStatus);
router.put("/:voucherId", checkAdminRole, voucherController.editVoucher);
router.delete("/:voucherId", checkAdminRole, voucherController.removeVoucher);

module.exports = router;
