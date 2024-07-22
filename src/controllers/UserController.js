const bcrypt = require("bcrypt");
const { decodeToken, generateAccessToken } = require("../utils/token"); // For password hashing

const UserModel = require("../models/UserModel");
const OrderModel = require("../models/OrderModel");

const addressController = require("./AddressController");
const otpController = require("./OTPController");

class UserController {
    constructor() {
    }

    async getAllUsers(req, res, next) {
        try {
            const listUsersData = await UserModel.find({});

            return res.status(200).json({
                status: "success",
                message: "get ok",
                data: listUsersData
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async changeUserActivationStatus(req, res, next) {

        try {
            const { userId } = req.params;

            const { isActive, blockReason } = req.body;

            if (isActive) {
                await UserModel.findByIdAndUpdate(userId, {
                    isActive
                });
            } else {
                const checkRequired = [
                    isActive === null || isActive === undefined && "isActive",
                    !blockReason && "blockReason"
                ].filter((field) => field);

                if (checkRequired.length > 0) {
                    return res.status(400).json({
                        status: "failure",
                        message: "Missing required field(s)",
                        data: {
                            missingFields: checkRequired
                        }
                    });
                }

                await UserModel.findByIdAndUpdate(userId, {
                    isActive,
                    $push: {
                        blockHistory: blockReason
                    }
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Successfully changed user activation status "
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async getCurrentUser(req, res, next) {
        try {
            const userData = await UserModel.findById(req._id);

            return res.status(200).json({
                status: "success",
                message: "Successfully get current user info",
                data: userData
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async getNewAccessToken(req, res, next) {
        try {
            const refreshToken = req.headers["x-rftk"];

            const { _id } = decodeToken(refreshToken);

            const userData = await UserModel.findById(_id);

            const newAccessToken = generateAccessToken(userData);

            return res.status(200).json({
                status: "success",
                message: "Get new access token successfully",
                data: newAccessToken
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

    async getUserInfo(req, res, next) {
        try {
            const { userId } = req.params;
            const userData = await UserModel.findById(userId);

            if (!userData) {
                return res.status(404).json({ status: "failure", message: `Cant find any user with _id = ${userId}` });
            }

            const { password, ...userInfo } = userData.toObject();

            res.status(200).json({
                status: "success",
                message: "",
                data: userInfo
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    }

    // Change Password
    async changePassword(req, res, next) {
        const { oldPassword, newPassword, otpCode } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                status: "error",
                message: "Old password and new password are required"
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                status: "error",
                message: "New password can't be the same as old password"
            });
        }

        try {
            const userData = await UserModel.findById(req._id);

            const isPasswordValid = await bcrypt.compare(oldPassword, userData.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Incorrect old password" });
            }

            const isValidOTP = await otpController.isOTPActive(req._id, otpCode, "password");

            if (!isValidOTP) {
                return res.status(203).json({
                    status: "failure",
                    message: "OTP is incorrect, please try again"
                });
            }

            userData.password = await bcrypt.hash(newPassword, 10);

            await userData.save();
            await otpController.changeStatusOTP(req._id, otpCode, "password");

            return res.status(200).json({
                status: "success",
                message: "Successfully changed password"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async getUserAddresses(req, res, next) {
        try {
            const listAddresses = await addressController.getUserAddresses(req._id);

            return res.status(200).json({
                status: "success",
                message: "Successfully get user address ",
                data: listAddresses
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async getAddressDetails(req, res, next) {
        const { addressId } = req.params;

        try {
            const [addressData] = await addressController.getAddressDetails(req._id, addressId);

            return res.status(200).json({
                status: "success",
                message: "Successfully get address details",
                data: addressData
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async createNewAddress(req, res, next) {
        const { newAddress } = req.body;

        try {
            const userData = await UserModel.findById(req._id);

            userData.listAddresses.push(newAddress);

            await userData.save();

            return res.status(201).json({
                status: "success",
                message: "Successfully created new address"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async editAddress(req, res, next) {
        const { newAddress } = req.body;
        const { addressId } = req.params;

        try {
            const userData = await UserModel.findById(req._id);

            userData.listAddresses = await addressController.editAddress(req._id, addressId, newAddress);

            await userData.save();

            return res.status(200).json({
                status: "success",
                message: ""
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async removeAddress(req, res, next) {
        const { addressId } = req.params;

        try {
            const userData = await UserModel.findById(req._id);

            userData.listAddresses = await addressController.removeAddress(req._id, addressId);

            userData.save();

            return res.status(200).json({
                status: "success",
                message: "Delete address successfully"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async changeEmailAddress(req, res, next) {
        const { newEmail, otpCode } = req.body;

        try {
            const isEmailExists = await UserModel.find({
                email: newEmail
            });

            if (isEmailExists.length > 0) {
                return res.status(203).json({
                    status: "failure",
                    message: "Email already exists, please try with another email"
                });
            }

            const isValidOTP = await otpController.isOTPActive(req._id, otpCode, "email");

            if (!isValidOTP) {
                return res.status(203).json({
                    status: "failure",
                    message: "OTP is incorrect, please try again"
                });
            }

            const userData = await UserModel.findById(req._id);

            userData.email = newEmail;

            await userData.save();
            await otpController.changeStatusOTP(req._id, otpCode, "email");

            return res.status(200).json({
                status: "success",
                message: "Successfully changed email address"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async changeUsername(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        const { newUsername } = req.body;

        try {
            const isUsernameExists = await UserModel.find({
                userName: newUsername
            });

            if (isUsernameExists.length > 0) {
                return res.status(203).json({
                    status: "failure",
                    message: "Username already exists, please try with another username"
                });
            }

            await UserModel.findByIdAndUpdate(req._id, {
                userName: newUsername
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully changed username"
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }

    async getUserOrders(req, res, next) {
        try {
            const listOrders = await OrderModel.find({
                customerId: req._id
            }).sort({
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

    async getOrdersByUserId(req, res, next) {
        try {

            const { userId } = req.params;

            const listOrders = await OrderModel.find({
                customerId: userId
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully get user orders",
                data: listOrders
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}`
            });
        }
    }
}

module.exports = new UserController();
