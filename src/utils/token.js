const jwt = require("jsonwebtoken");

const generateAccessToken = (userData) => {
    const {_id, userName, email, role} = userData;
    const payload = {_id, userName, email, role};
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "5s"});
};

const generateRefreshToken = (userData) => {
    const {_id} = userData;
    const payload = {_id, isRefreshToken: true};

    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "30d"});
};

const decodeToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

module.exports = {decodeToken, generateRefreshToken, generateAccessToken};
