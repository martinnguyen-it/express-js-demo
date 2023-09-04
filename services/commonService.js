const { isEmpty } = require('lodash');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../helpers/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = class commonService {
    static deleteOne(Model) {
        return catchAsync(async (req, res, next) => {
            const doc = await Model.findByIdAndDelete(req.params.id);

            if (!doc) {
                return next(
                    new AppError('No document found with that ID.', 404),
                );
            }

            res.status(204).json({ status: 'success', data: null });
        });
    }

    static updateOne(Model) {
        return catchAsync(async (req, res, next) => {
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });

            if (!doc) {
                return next(
                    new AppError('No document found with that ID.', 404),
                );
            }

            res.status(200).json({
                status: 'success',
                data: doc,
            });
        });
    }

    static createOne(Model) {
        return catchAsync(async (req, res, next) => {
            const doc = await Model.create(req.body);
            res.status(201).json({ status: 'success', data: doc });
        });
    }

    static getOne(Model, populateOptions) {
        return catchAsync(async (req, res, next) => {
            let query = Model.findById(req.params.id);

            if (populateOptions) query = query.populate(populateOptions);

            const doc = await query;

            if (!doc) {
                return next(
                    new AppError('No document found with that ID.', 404),
                );
            }

            res.status(200).json({ status: 'success', data: doc });
        });
    }

    /**
     *
     * @param {Model collection} Model
     * @param {Type: Object - Options for populate} populateOptions
     */
    static getAll(Model, populateOptions) {
        return catchAsync(async (req, res, next) => {
            let query =
                req.filter && !isEmpty(req.filter)
                    ? Model.find(req.filter)
                    : Model.find();
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
    }

    static getByUserId(Model, populateOptions) {
        return catchAsync(async (req, res, next) => {
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
    }
};
