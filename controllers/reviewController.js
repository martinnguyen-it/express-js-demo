const isArray = require('lodash/isArray');
const Review = require('../models/reviewModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (isArray(req.body.tour)) req.body.tour = req.body.tour[0];
    req.body.user = req.user.id;
    next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.deleteReviewMe = catchAsync(async (req, res, next) => {
    const doc = await Review.find({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!doc) {
        return next(new AppError('No document found with that ID.', 404));
    }

    res.status(204).json({ status: 'success', data: null });
});

exports.updateReviewMe = catchAsync(async (req, res, next) => {
    const doc = await Review.findOneAndUpdate(
        {
            id: req.params.id,
            user: req.user.id,
        },
        req.body,
        {
            new: true,
            runValidators: true,
        },
    );

    if (!doc) {
        return next(new AppError('No document found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc,
    });
});
