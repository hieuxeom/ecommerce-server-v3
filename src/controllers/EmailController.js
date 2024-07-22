const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { decodeToken } = require("../utils/token");
const OAuth2 = google.auth.OAuth2;

const changePasswordTemplate = require("../utils/email-template/change-password");
const changeEmailAddressTemplate = require("../utils/email-template/change-email");

const UserModel = require("../models/UserModel");
const OTPModel = require("../models/OTPModel");

class EmailController {

    constructor() {
        this.sendMailChangePassword = this.sendMailChangePassword.bind(this);
        this.sendMailChangeEmailAddress = this.sendMailChangeEmailAddress.bind(this);
    }

    async checkCode(req, res, next) {

        const { code, type } = req.query;
    }

    generateCode() {
        return (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString().padStart(6, "0");
    }

    async createTransporter() {
        try {
            const oauth2Client = new OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                "https://developers.google.com/oauthplayground"
            );

            oauth2Client.setCredentials({
                refresh_token: process.env.REFRESH_TOKEN
            });

            const accessToken = await new Promise((resolve, reject) => {
                oauth2Client.getAccessToken((err, token) => {
                    if (err) {
                        console.log("*ERR: ", err);
                        reject();
                    }
                    resolve(token);
                });
            });

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: process.env.USER_EMAIL,
                    accessToken,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN
                }
            });
            return transporter;
        } catch (err) {
            return err;
        }
    };

    async sendMailChangePassword(req, res, next) {
        const token = req.headers.authorization.split(" ")[1];

        try {
            const { _id } = decodeToken(token);

            const userData = await UserModel.findById(_id);

            const { userName, email } = userData;

            const otpCode = this.generateCode();
            const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

            const newOTP = new OTPModel({
                otpCode,
                userId: _id,
                expiredAt,
                type: "password"
            });

            await newOTP.save();

            const mailOptions = {
                from: process.env.USER_EMAIL,
                to: email,
                subject: "Have you requested to change your password?",
                html: changePasswordTemplate(userName, otpCode)
            };

            let emailTransporter = await this.createTransporter();
            await emailTransporter.sendMail(mailOptions);
            return res.status(200).json({
                status: "success",
                message: "Successfully sent email"
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}}`
            });
        }
    }

    async sendMailChangeEmailAddress(req, res, next) {

        try {

            const otpCode = this.generateCode();
            const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

            const newOTP = new OTPModel({
                otpCode,
                userId: req._id,
                expiredAt,
                type: "email"
            });

            await newOTP.save();

            const mailOptions = {
                from: process.env.USER_EMAIL,
                to: req.body.email,
                subject: "Have you requested to change your email address?",
                html: changeEmailAddressTemplate(req.userName, otpCode)
            };

            let emailTransporter = await this.createTransporter();
            await emailTransporter.sendMail(mailOptions);

            return res.status(200).json({
                status: "success",
                message: "Successfully sent email"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: `${err.name} - ${err.message}}`
            });
        }
    }
}

module.exports = new EmailController();