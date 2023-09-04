const Review = require('../models/reviewModel');
const commonService = require('./commonService');

module.exports = class reviewService extends commonService {
    static async updateReview(props) {
        const { query, data } = props;

        const doc = await Review.findOneAndUpdate(query, data, {
            new: true,
            runValidators: true,
        });
        return doc;
    }

    static async deleteReview(query) {
        const doc = await Review.findOneAndDelete(query);
        return doc;
    }
};
