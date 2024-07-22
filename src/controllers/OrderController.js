const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const UserModel = require("../models/UserModel");
const VoucherModel = require("../models/VoucherModel");

const { decodeToken } = require("../utils/token");

class OrderController {
    constructor() {
        this.cancelOrder = this.cancelOrder.bind(this);
    }

    async getAllOrders(req, res, next) {

        const filterOptions = {};
        const { filter } = req.query;

        try {
            if (filter) {
                filterOptions.orderStatus = filter;
            }

            const listOrders = await OrderModel.find(filterOptions).sort({
                orderDate: -1
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully get list orders",
                data: listOrders
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }

    }

    async getOrderDetails(req, res, next) {

        try {
            const { orderId } = req.params;

            const orderData = await OrderModel.findById(orderId).lean();

            const { orderItems } = orderData;

            Promise.all(orderItems.map((item) => {
                return new Promise((resolve) => {
                    ProductModel.findById(item.productId).then((response) => {

                        const { productName, productVariants } = response;

                        resolve({
                            productId: item.productId,
                            quantity: item.quantity,
                            variantKey: item.variantKey,
                            priceAtBuy: item.priceAtBuy ?? productVariants.find((_p) => _p.variantKey === item.variantKey).variantPrice.discountPrice,
                            productName,
                            productVariant: productVariants.find((_p) => _p.variantKey === item.variantKey),
                            isReview: item.isReview
                        });
                    });
                });
            })).then((newOrderItems) => {
                return res.status(200).json({
                    status: "success",
                    message: "Successfully get order details",
                    data: {
                        ...orderData,
                        orderItems: newOrderItems
                    }
                });

            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}}`
            });
        }
    }

    getOrdersByUserId(req, res, next) {

    }

    async createNewOrder(req, res, next) {

        try {
            const postData = req.body;
            //
            const orderData = {
                ...postData,
                customerId: req._id
            };
            console.log(orderData);

            const { orderItems } = postData;
            const { voucherCode } = postData;

            await VoucherModel.findOneAndUpdate({
                voucherCode
            }, {
                $inc: {
                    usedCount: 1
                }
            });

            await Promise.all(orderItems.map((item) => {
                return ProductModel.findByIdAndUpdate(item.productId, {

                    $inc: {
                        productStock: -item.quantity,
                        soldCount: item.quantity
                    }

                });
            }));
            const newOrder = new OrderModel(orderData);

            await newOrder.save();

            const userData = await UserModel.findById(req._id);

            userData.cart = {
                cartItems: [],
                voucherCode: "",
                totalPrice: 0,
                discountPrice: 0,
                deliveryFee: 0,
                subTotalPrice: 0
            };

            userData.save();

            return res.status(201).json({
                status: "success",
                message: "Order created successfully"
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired "
                });
            }

            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async changeOrderStatus(req, res, next) {

        try {
            const { orderId } = req.params;

            const { orderStatus } = req.body;

            await OrderModel.findByIdAndUpdate(orderId, {
                orderStatus
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully changed order status"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}}`
            });
        }
    }

    async updateAllOrdersStatus(req, res, next) {

        try {

            const { fromStatus, toStatus } = req.body;

            const checkRequired = [
                !fromStatus && "fromStatus",
                !toStatus && "toStatus"
            ].filter((item) => item);

            if (checkRequired.length > 0) {
                return res.status(404).json({
                    status: "failure",
                    message: "Missing required field(s)",
                    data: {
                        missingFields: checkRequired
                    }
                });
            }

            await OrderModel.updateMany({
                orderStatus: fromStatus
            }, {
                orderStatus: toStatus
            });

            return res.status(201).json({
                status: "success",
                message: "Order created successfully"
            });
        } catch (err) {

            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}}`
            });
        }

    }

    async cancelOrder(req, res, next) {
        try {

            const { orderId } = req.params;
            const { explainReason } = req.body;

            if (!req.role === 1 && await this.checkIsOrderOwner(orderId, req._id)) {
                await OrderModel.findByIdAndUpdate(orderId, {
                    orderStatus: "canceled",
                    explainReason: "The order was canceled by the user"
                });

            } else if (req.role === 1) {
                await OrderModel.findByIdAndUpdate(orderId, {
                    orderStatus: "canceled",
                    explainReason
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Successfully canceled order"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async checkIsOrderOwner(orderId, userId) {
        const listUserOrder = await UserModel.findById(userId);
        console.log(listUserOrder);

        return listUserOrder.filter((order) => order._id === orderId).length > 0;
    }

}

module.exports = new OrderController();
