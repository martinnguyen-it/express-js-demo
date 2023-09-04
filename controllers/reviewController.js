const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../helpers/appError');
const reviewService = require('../services/reviewService');

exports.getAllReviews = reviewService.getAll(Review);
exports.getReview = reviewService.getOne(Review);
exports.createReview = reviewService.createOne(Review);
exports.deleteReview = reviewService.deleteOne(Review);
exports.updateReview = reviewService.updateOne(Review);

exports.deleteReviewMe = catchAsync(async (req, res, next) => {
    const doc = await reviewService.deleteReview({
        _id: req.params.id,
        user: req.user.id,
    });

    if (!doc) {
        return next(new AppError('No document found with that ID.', 404));
    }

    res.status(204).json({ status: 'success', data: null });
});

exports.updateReviewMe = catchAsync(async (req, res, next) => {
    const doc = await reviewService.updateReview({
        query: {
            _id: req.params.id,
            user: req.user.id,
        },
        data: req.body,
    });

    if (!doc) {
        return next(new AppError('No document found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc,
    });
});
