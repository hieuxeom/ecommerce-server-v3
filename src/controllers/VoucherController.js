const VoucherModel = require("../models/VoucherModel");
const { decodeToken } = require("../utils/token");

class VoucherController {
    constructor() {
    }

    async getAllVouchers(req, res, next) {
        const listVouchers = await VoucherModel.find();

        if (listVouchers.length > 0) {
            return res.status(200).json({
                status: "success",
                message: "",
                data: listVouchers
            });
        } else {
            return res.status(204).json({
                status: "success",
                message: "No vouchers found to response"
            });
        }
    }

    async getVoucherById(req, res, next) {
        try {
            let { voucherId } = req.params;

            voucherId = voucherId.toLowerCase();

            try {
                const voucherData = await VoucherModel.findById(voucherId);

                if (voucherData.length === 0) {
                    return res.status(204).json({
                        status: "success",
                        message: `Can't find any voucher with id ${voucherId}`
                    });
                }

                return res.status(200).json({
                    status: "success",
                    message: `Successfully get voucher data`,
                    data: voucherData
                });
            } catch (err) {
                const voucherData = await VoucherModel.findOne({
                    voucherCode: voucherId
                });

                if (voucherData.length === 0) {
                    return res.status(204).json({
                        status: "success",
                        message: `Can't find any voucher with code ${voucherId}`
                    });
                }

                return res.status(200).json({
                    status: "success",
                    message: `Successfully get voucher data`,
                    data: voucherData
                });
            }
        } catch (err) {

            if (err.name === "CastError") {
                return res.status(404).json({
                    status: "error",
                    message: "Invalid Voucher Id or Voucher Code"
                });
            }

            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async createNewVoucher(req, res, next) {

        const {
            voucherCode, discountPercents, description, validFrom, validTo, type, maxUsage, isActive, minimumOrderValue
        } = req.body;

        const checkRequired = [
            !voucherCode && "voucherCode",
            !discountPercents && "discountPercents",
            !description && "description",
            !minimumOrderValue && "minimumOrderValue",
            !validFrom && "validFrom",
            !validTo && "validTo",
            !type && "type",
            !maxUsage && "maxUsage",
            !isActive && "isActive"

        ].filter((item) => item);

        if (checkRequired.length > 0) {
            return res.status(404).json({
                status: "failure",
                message: "Missing some required fields, please fill all required fields before submitting",
                data: {
                    missingFields: checkRequired
                }
            });
        }

        try {
            const newVoucher = new VoucherModel(req.body);

            await newVoucher.save();

            return res.status(201).json({
                status: "success",
                message: "Successfully created new voucher"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async editVoucher(req, res, next) {

        const editData = req.body;

        const { voucherId } = req.params;

        try {
            await VoucherModel.findByIdAndUpdate(voucherId, editData);

            return res.status(200).json({
                status: "success",
                message: "Successfully edited voucher data"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async changeVoucherActivationStatus(req, res, next) {
        const { voucherId } = req.params;

        const { isActive } = req.body;

        try {
            await VoucherModel.findByIdAndUpdate(voucherId, {
                isActive
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully changed voucher activation status"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async removeVoucher(req, res, next) {

        const { voucherId } = req.params;

        try {
            await VoucherModel.findByIdAndDelete(voucherId);
            return res.status(200).json({
                status: "success",
                message: "Successfully deleted voucher"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.name + " - " + err.message
            });
        }
    }

    async getVoucherByCode(voucherCode) {
        return VoucherModel.find({
            voucherCode
        });
    }

    async checkValidVoucher(voucherCode) {
        if (voucherCode === "") {
            return true;
        }

        const [voucherData] = await VoucherModel.find({
            voucherCode: voucherCode.toLowerCase()
        });

        if (!voucherData || voucherData.usedCount >= voucherData.maxUsage) {
            return false;
        }

        return !!voucherData;
    }
}

module.exports = new VoucherController();
