const User = require('../models/userModel');
const commonService = require('./commonService');

module.exports = class userService extends commonService {
    static async getUserWithPassWord(data) {
        const user = await User.findOne(data).select('+password');
        return user;
    }

    static async getUserByIdWithPassWord(id) {
        const user = await User.findById(id).select('+password');
        return user;
    }

    static async getUserById(id) {
        const user = await User.findById(id);
        return user;
    }

    static async getUser(data) {
        const user = await User.findOne(data);
        return user;
    }
};
