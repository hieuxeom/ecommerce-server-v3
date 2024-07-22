const OrderModel = require("../models/OrderModel");
const UserModel = require("../models/UserModel");
const { decodeToken } = require("../utils/token");

class AnalyticController {
    constructor() {
        this.getAnalyticsData = this.getAnalyticsData.bind(this);
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    getAllDates(startDate, endDate) {
        const dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= new Date(endDate)) {
            dates.push(this.formatDate(currentDate));
            currentDate = this.addDays(currentDate, 1);
        }
        return dates;
    }

    async getOrdersPerDay() {
        const listOrder = await OrderModel.find().lean();

        const dates = listOrder.map(order => new Date(order.orderDate));
        const minDate = this.formatDate(new Date(Math.min(...dates)));
        const maxDate = this.formatDate(new Date());

        const allDates = this.getAllDates(minDate, maxDate);

        const ordersPerDay = listOrder.reduce((acc, order) => {
            const date = new Date(order.orderDate).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const finalResult = allDates.map(date => ({
            time: Math.floor(new Date(date).getTime() / 1000),
            value: ordersPerDay[date] || 0
        }));
        return {
            totalOrders: listOrder.length,
            todayOrders: finalResult[finalResult.length - 1].value,
            chartData: finalResult
        };
    }

    async getUsersPerDay() {
        const listUsers = await UserModel.find().lean();

        const dates = listUsers.map(user => new Date(user.createdAt));
        const minDate = this.formatDate(new Date(Math.min(...dates)));
        const maxDate = this.formatDate(new Date());

        const allDates = this.getAllDates(minDate, maxDate);

        const usersPerDay = listUsers.reduce((acc, user) => {
            const date = new Date(user.createdAt).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const finalResult = allDates.map(date => ({
            time: Math.floor(new Date(date).getTime() / 1000),
            value: usersPerDay[date] || 0
        }));

        return {
            totalUsers: listUsers.length,
            todayUsers: finalResult[finalResult.length - 1].value,
            chartData: finalResult
        };
    }

    async getAnalyticsData(req, res, next) {

        const totalOrdersPerDay = await this.getOrdersPerDay();
        const totalUsersPerDay = await this.getUsersPerDay();

        return res.status(200).json({
            status: "success",
            message: "success",
            data: {
                totalOrdersPerDay,
                totalUsersPerDay
            }
        });
    }

}

module.exports = new AnalyticController();