const Tour = require('../models/tourModel');
const commonService = require('./commonService');

module.exports = class tourService extends commonService {
    static async findAllByOptions(options) {
        const tour = await Tour.find(options);

        return tour;
    }

    static async findOneByOptions(options) {
        const tour = await Tour.findOne(options).populate({
            path: 'reviews',
            fields: 'review rating user',
        });
        return tour;
    }

    static async staticCollection(options) {
        const statistical = await Tour.aggregate(options);

        return statistical;
    }
};
