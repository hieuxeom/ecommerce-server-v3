var express = require("express");
var router = express.Router();

const productRouter = require("./productRouter");
const categoryRouter = require("./categoryRouter");
const userRouter = require("./userRouter");
const cartRouter = require("./cartRouter");
const authRouter = require("./authRouter");
const voucherRouter = require("./voucherRouter");
const orderRouter = require("./orderRouter");
const emailRouter = require("./emailRouter");
const analyticRouter = require("./analyticRouter");

router.use("/products", productRouter);
router.use("/categories", categoryRouter); // done
router.use("/users", userRouter); // done
router.use("/auth", authRouter); // done
router.use("/carts", cartRouter); // some routes have not been completed yet
router.use("/vouchers", voucherRouter); //done
router.use("/orders", orderRouter); // some routes have not been completed yet
router.use("/email", emailRouter); // done
router.use("/analytics", analyticRouter); // done
module.exports = router;
