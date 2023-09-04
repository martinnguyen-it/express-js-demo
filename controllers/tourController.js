const { map } = require('lodash');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../helpers/appError');
const tourService = require('../services/tourService');
const bookingService = require('../services/bookingService');

exports.getAllTours = tourService.getAll(Tour, { path: 'reviews' });

exports.getMyTour = catchAsync(async (req, res, next) => {
    const booking = await bookingService.getAllBooking({
        propQueryMongo: {
            user: req.user.id,
            paid: true,
        },
        reqQuery: req.query,
    });

    if (!booking) {
        return next(new AppError('No tour found.', 404));
    }

    const respon = map(booking, (item) => item.tour);
    res.status(200).json({ status: 'success', data: respon });
});

exports.getTour = tourService.getOne(Tour, {
    path: 'reviews',
    fields: 'review rating user',
});

exports.getTourBySlug = catchAsync(async (req, res, next) => {
    const tour = await tourService.findOneByOptions({ slug: req.params.slug });

    if (!tour) {
        return next(new AppError('No tour found.', 404));
    }

    res.status(200).json({ status: 'success', data: tour });
});

exports.createTour = tourService.createOne(Tour);

exports.updateTour = tourService.updateOne(Tour);

exports.deleteTour = tourService.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const statistical = await tourService.staticCollection([
        // {
        //     $match: { ratingsAverage: { $gte: 4.7 } },
        // },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY' },
        //     },
        // },
    ]);

    res.status(200).json({ status: 'success', data: { statistical } });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await tourService.staticCollection([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year + 1}-01-01`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { numTourStarts: -1 },
        },
    ]);

    res.status(200).json({ status: 'success', data: { plan } });
});

//('/tour-within/:distance/center/:latlng/unit/:unit')

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    if ((unit !== 'mi' && unit !== 'km') || !distance || distance < 0) {
        return next(
            new AppError(
                'Invalid request params. Request params must include distance, latlng and unit.',
                401,
            ),
        );
    }

    if (!lat || !lng) {
        return next(new AppError('Invalid latlng params.', 401));
    }

    const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

    const tours = await tourService.findAllByOptions({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({ status: 'success', len: tours.length, data: tours });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;

    if (unit !== 'mi' && unit !== 'km') {
        return next(
            new AppError('Invalid request unit. Type unit is mi | km.', 401),
        );
    }
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitute and longitude in the format lat,lng.',
                400,
            ),
        );
    }

    const distances = await tourService.staticCollection([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});
