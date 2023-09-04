const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');

module.exports = class reviewService {
    static async getAllBooking(props) {
        const { propQueryMongo, reqQueryMongo } = props;

        const queryMongoDB = Booking.find(propQueryMongo).populate({
            path: 'tour',
        });

        const features = new APIFeatures(queryMongoDB, reqQueryMongo)
            .filter()
            .sort()
            .limitFields()
            .pagination();

        const docs = await features.query;

        return docs;
    }

    static async createBooking(data) {
        await Booking.create(data);
    }

    static async updateBooking(props) {
        const { query, data } = props;

        const doc = await Booking.findOneAndUpdate(query, data, {
            new: true,
            runValidators: true,
        });
        return doc;
    }
};
