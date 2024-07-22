const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OTPModel = new Schema(
    {
        otpCode: {type: String, required: true},
        userId: {type: String, required: true},
        expiredAt: {type: Date, required: true},
        type: {type: String, required: true},
        isUsed: {type: Boolean, default: false}
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("otp", OTPModel);