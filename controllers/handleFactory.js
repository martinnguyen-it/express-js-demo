const { isEmpty } = require('lodash');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document found with that ID.', 404));
        }

        res.status(204).json({ status: 'success', data: null });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No document found with that ID.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: doc,
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({ status: 'success', data: doc });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);

        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc) {
            return next(new AppError('No document found with that ID.', 404));
        }

        res.status(200).json({ status: 'success', data: doc });
    });

/**
 *
 * @param {Model collection} Model
 * @param {Type: Object - Options for populate} populateOptions
 */
exports.getAll = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query =
            req.filter && !isEmpty(req.filter)
                ? Model.find(req.filter)
                : Model.find();
        if (populateOptions && !isEmpty(populateOptions))
            query = query.populate(populateOptions);

        const len = await Model.countDocuments({
            secretTour: { $ne: true },
        });
        const features = new APIFeatures(query, req.query)
            .filter()
            .sort()
            .limitFields()
            .pagination();
        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            len: len,
            data: docs,
        });
    });

exports.getByUserId = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.find({ user: req.user.id });

        if (populateOptions && !isEmpty(populateOptions))
            query = query.populate(populateOptions);

        const features = new APIFeatures(query, req.query)
            .filter()
            .sort()
            .limitFields()
            .pagination();
        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            len: docs.length,
            data: docs,
        });
    });
