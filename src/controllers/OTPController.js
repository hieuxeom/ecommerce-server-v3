const OTPModel = require('../models/OTPModel');

class OTPController {
    constructor() {
    }

    async isOTPActive(userId, otpCode, typeCode) {
        const [otpData] = await OTPModel.find({
            otpCode,
            type: typeCode,
            userId,
        })

        if (!otpData || otpData.isUsed) {
            return false;
        }

        const currentTime = new Date();
        return currentTime < otpData.expiredAt;

    }

    async changeStatusOTP(userId, otpCode, typeCode) {
        try {
            await OTPModel.findOneAndUpdate({
                otpCode,
                type: typeCode,
                userId,
            }, {
                isUsed: true
            })
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = new OTPController();