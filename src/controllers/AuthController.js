const bcrypt = require("bcrypt");

const { generateAccessToken, generateRefreshToken, decodeToken } = require("../utils/token");

const UserModel = require("../models/UserModel");

class AuthController {
    constructor() {
        this.signIn = this.signIn.bind(this);
    }

    async index(req, res, next) {
        return res.json({ test: "Test" });
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: "error", message: "Email and password are required" });
            }

            let user = await UserModel.findOne({ email });

            if (!user) {
                return res
                    .status(401)
                    .json({ status: "error", message: "Invalid login credentials" });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ status: "error", message: "Invalid login credentials" });
            }

            return res.status(200).json({
                status: "success",
                message: "Successfully logged in",
                data: {
                    _id: user._id,
                    accessToken: generateAccessToken(user),
                    refreshToken: generateRefreshToken(user)
                }
            });
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Internal server error" });
        }

    }

    async signUp(req, res, next) {
        try {
            const { userName, email, password } = req.body;

            if (!userName || !email || !password) {
                return res.status(400).json({ message: "Username, email and password are required" });
            }

            const existingUser = await UserModel.find({ $or: [{ email }, { userName }] });

            if (existingUser.length > 0) {
                return res.status(400).json({ message: "Email or Username already exists" });
            }

            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new UserModel({ userName, email, password: hashedPassword });
            await newUser.save();

            const { password: userPassword, newUserInfo } = await UserModel.find({ email });

            res.status(201).json({
                status: "success",
                message: "Successfully created new account",
                data: newUserInfo
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: "error",
                message: "Internal server error"
            });
        }
    }

    async checkIsAdmin(req, res, next) {

        try {
            const userData = await UserModel.findById(req._id);

            return res.status(200).json({
                status: "success",
                message: "Successfully check admin role",
                data: userData.role === 1
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: err.message
            });
        }

    }

}

module.exports = new AuthController();
