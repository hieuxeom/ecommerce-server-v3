const ProductModel = require("../models/ProductModel");
const OrderModel = require("../models/OrderModel");
const { decodeToken } = require("../utils/token");

class ReviewController {
    constructor() {
    }

    async getAllReviews(req, res, next) {
    }

    async createNewReview(req, res, next) {
        try {

            const { orderId, reviewContent, reviewStar } = req.body;
            const { productId } = req.params;

            const productData = await ProductModel.findById(productId);

            if (!productData) {
                return res.status(400).json({
                    status: "error",
                    message: "No products were found with the id provided"
                });
            }

            let { productReviews } = productData;

            productReviews.push({
                userName: req.userName,
                reviewContent,
                reviewStar
            });

            const orderData = await OrderModel.findById(orderId);

            orderData.orderItems.forEach(item => {
                if (item.productId === productId) {
                    item.isReview = true;
                }
            });

            await productData.save();
            await orderData.save();

            return res.status(201).json({
                status: "success",
                message: "Reviews successfully"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

}

module.exports = new ReviewController();