const UserModel = require("../models/UserModel");

class AddressController {
    constructor() {
    }

    async getUserAddresses(userId) {
        const {listAddresses} = await UserModel.findById(userId);
        return listAddresses;
    }

    async getAddressDetails(userId, addressId) {
        const listAddresses = await this.getUserAddresses(userId);

        return listAddresses.filter(address => address._id == addressId)
    }

    async editAddress(userId, addressId, newInfo) {
        const listAddresses = await this.getUserAddresses(userId);
        const {fullName, email, phoneNumber, fullAddress} = newInfo

        listAddresses.forEach((address) => {

            if (address._id == addressId) {
                address.fullName = fullName
                address.email = email
                address.phoneNumber = phoneNumber
                address.fullAddress = fullAddress
            }
        })

        return listAddresses;
    }

    async removeAddress(userId, addressId) {
        const listAddresses = await this.getUserAddresses(userId);

        return listAddresses.filter(address => address._id != addressId);
    }
}

module.exports = new AddressController();
