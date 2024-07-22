const { decodeToken } = require("../utils/token");

const UserModel = require("../models/UserModel");
const ProductModel = require("../models/ProductModel");

const VoucherController = require("./VoucherController");

class CartController {
    constructor() {
        this.editCartVoucher = this.editCartVoucher.bind(this);
        this.addProductToCart = this.addProductToCart.bind(this);
        this.updateNewQuantity = this.updateNewQuantity.bind(this);
    }

    async getCurrentUserCart(req, res, next) {

        try {
            const { cart } = await UserModel.findById(req._id).lean();

            const { cartItems } = cart;

            Promise.all(cartItems.map((item) => {
                return new Promise((resolve) => {
                    ProductModel.findById(item.productId).then((response) => {
                        const { productName, productVariants } = response;
                        resolve({
                            productId: item.productId,
                            quantity: item.quantity,
                            variantKey: item.variantKey,
                            productName,
                            productPrice: productVariants.find((_p) => _p.variantKey === item.variantKey).variantPrice,
                            productVariant: productVariants.find((_p) => _p.variantKey === item.variantKey)
                        });
                    });
                });
            })).then((newCartItems) => {
                const subTotalPrice = newCartItems.reduce((prev, current) => prev + (current.productPrice.discountPrice * current.quantity), 0);
                return res.status(200).json({
                    status: "success",
                    message: "Successfully get user cart",
                    data: {
                        ...cart,
                        cartItems: newCartItems,
                        subTotalPrice
                    }
                });

            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async addProductToCart(req, res, next) {

        try {
            const { productId, quantity, variantKey } = req.body;

            const userData = await UserModel.findById(req._id);

            const { cart: userCart } = userData;

            const { cartItems } = userCart;

            let isProductExists = false;

            cartItems.forEach((item) => {
                if (item.productId === productId && item.variantKey === variantKey) {
                    item.quantity += quantity;
                    isProductExists = true;
                }
            });

            if (!isProductExists) {
                cartItems.push({
                    productId,
                    quantity,
                    variantKey
                });
            }
            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Successfully added product to cart"
            });
        } catch (err) {

            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });

        }
    }

    async updateNewQuantity(req, res, next) {

        try {
            const { productId, variantKey, newQuantity } = req.body;
            const userData = await UserModel.findById(req._id);

            const { cart: userCart } = userData;

            let { cartItems } = userCart;

            cartItems.forEach((item) => {
                if (item.productId === productId && item.variantKey === variantKey) {
                    item.quantity = newQuantity;
                }
            });

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Successfully updated new quantity"
            });
        } catch (err) {

            return res.status(401).json({
                status: "error",
                message: err.name + " - " + err.message
            });

        }
    }

    async deleteProductInCart(req, res, next) {
        try {

            const { productId, productVariant } = req.body;

            console.log(productId, productVariant);
            const userData = await UserModel.findById(req._id);

            const { cart } = userData;
            let { cartItems } = cart;
            userData.cart.cartItems = cartItems.filter((item) => {
                if (item.productId !== productId) {
                    return item;
                }

                if (item.productId === productId && item.variantKey !== productVariant) {
                    return item;
                }
            });

            console.log(userData.cart.cartItems);

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Delete product successfully"
            });
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "Token is expired"
                });
            } else {
                return res.status(401).json({
                    status: "error",
                    message: err.name + " - " + err.message
                });
            }
        }
    }

    async editCartVoucher(req, res, next) {

        try {
            const userData = await UserModel.findById(req._id);

            let { voucherCode } = req.body;
            voucherCode = voucherCode.toLowerCase();

            if (voucherCode === "") {
                userData.cart.voucherCode = voucherCode;

                await userData.save();

                return res.status(200).json({
                    status: "success",
                    message: "Apply voucher successfully"
                });
            }

            if (await VoucherController.checkValidVoucher(voucherCode)) {
                const [voucherData] = await VoucherController.getVoucherByCode(voucherCode);

                const { minimumOrderValue } = voucherData;
                const { subTotalPrice } = userData.cart;

                if (minimumOrderValue > subTotalPrice) {
                    return res.status(400).json({
                        status: "failure",
                        message: "The voucher cannot be used because the order has not reached the minimum value"
                    });
                }

                userData.cart.voucherCode = voucherCode;

                await userData.save();

                return res.status(200).json({
                    status: "success",
                    message: "Apply voucher successfully"
                });
            } else {
                return res.status(404).json({
                    status: "failure",
                    message: "Invalid voucher"
                });
            }
        } catch (err) {

            return res.status(500).json(
                {
                    status: "error",
                    message: err.name + " - " + err.message
                }
            );
        }
    }

    async updateCartDetails(req, res, next) {

        try {

            const { totalPrice, discountPrice, deliveryFee, subTotalPrice } = req.body;

            const userData = await UserModel.findById(req._id);

            userData.cart.totalPrice = totalPrice;
            userData.cart.discountPrice = discountPrice;
            userData.cart.deliveryFee = deliveryFee;
            userData.cart.subTotalPrice = subTotalPrice;

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Successfully update cart details"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async removeUserCart(req, res, next) {

        try {

            const userData = await UserModel.findById(req._id);

            userData.cart.cartItems = [];

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: "Successfully deleted user cart"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }
}

module.exports = new CartController();
