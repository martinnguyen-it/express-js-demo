const sharp = require('sharp');
const multer = require('multer');
const { map } = require('lodash');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false,
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        }),
    );

    next();
});

exports.aliasTopTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,-ratingsAverage';
    next();
};

exports.getAllTours = factory.getAll(Tour, { path: 'reviews' });
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     const features = new APIFeatures(Tour.find().populate('reviews'), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .pagination();
//     const tours = await features.query;

//     res.status(200).json({
//         status: 'success',
//         len: tours.length,
//         data: tours,
//     });
// });

exports.getMyTour = catchAsync(async (req, res, next) => {
    const booking = await Booking.find({
        user: req.user.id,
        paid: true,
    }).populate({
        path: 'tour',
    });

    if (!booking) {
        return next(new AppError('No tour found.', 404));
    }

    const respon = map(booking, (item) => item.tour);
    res.status(200).json({ status: 'success', data: respon });
});

exports.getTour = factory.getOne(Tour, {
    path: 'reviews',
    fields: 'review rating user',
});

exports.getTourBySlug = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });

    if (!tour) {
        return next(new AppError('No tour found.', 404));
    }

    res.status(200).json({ status: 'success', data: tour });
});

exports.getTour = factory.getOne(Tour, {
    path: 'reviews',
    fields: 'review rating user',
});
// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     if (!tour) {
//         return next(new AppError('No tour found with that ID.', 404));
//     }

//     res.status(200).json({ status: 'success', data: tour });
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({ status: 'success', data: newTour });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//     });

//     if (!tour) {
//         return next(new AppError('No tour found with that ID.', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: { tour },
//     });
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError('No tour found with that ID.', 404));
//     }

//     res.status(204).json({ status: 'success', data: null });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    const statistical = await Tour.aggregate([
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

    const plan = await Tour.aggregate([
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

    const tours = await Tour.find({
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

    const distances = await Tour.aggregate([
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
