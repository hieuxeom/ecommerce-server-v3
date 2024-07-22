const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderItem = new Schema({
    productId: { type: String, required: true },
    variantKey: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceAtBuy: { type: Number, required: true },
    isReview: { type: Boolean, default: false }
});

const CustomerInfo = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    fullAddress: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    orderItems: [OrderItem],
    totalPrice: { type: Number, required: true },
    subTotalPrice: { type: Number, required: true },
    reducedFee: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    voucherCode: { type: String },
    orderStatus: {
        type: String,
        enum: ["waiting", "processing", "shipped", "delivered", "completed", "canceled", "returned"],
        default: "waiting"
    },
    customerInfo: CustomerInfo,
    isReturned: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
    explainReason: { type: String, default: "" }
});

// Create the model for the order history

module.exports = mongoose.model("orders", orderSchema);
