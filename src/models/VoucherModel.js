const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const VoucherModel = new Schema(
    {
        voucherCode: { type: String, required: true },
        discountPercents: { type: Number, required: true, min: 1, max: 100 },
        description: { type: String, required: true },
        validFrom: { type: Date, required: true },
        validTo: { type: Date, required: true },
        minimumOrderValue: { type: Number, min: 0, default: 0 },
        type: { type: String, required: true, default: "bill" },
        usedCount: { type: Number, default: 0 },
        maxUsage: { type: Number, required: true, min: 1 },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("vouchers", VoucherModel);
