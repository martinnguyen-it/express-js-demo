const mongoose = require('mongoose');
const moment = require('moment');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            trim: true,
            maxlength: [
                40,
                'Field name must have less or equal than 40 characters.',
            ],
            minlength: [
                10,
                'Field name must have more or equal than 10 characters.',
            ],
            unique: true,
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either : easy, medium, difficult.',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0.'],
            max: [5, 'Rating must be below 5.0.'],
            set: (val) => Math.round(val * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price.'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    return value < this.price;
                },
                message:
                    'Price discount ({VALUE}) should be below regular price.',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
        },
        images: [String],

        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

tourSchema.index({ price: 1, ratingsAverage: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

tourSchema.pre('save', function (next) {
    const date = new Date();
    // this.price *= 20000;
    this.slug = `${slugify(this.name, { lower: true })}-${moment(date).format(
        'DDHHmmss',
    )}`;
    next();
});

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) { - only with find, not for findById  and findOne
tourSchema.pre(/^find/, function (next) {
    // all pre-hook start have find...
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt',
    });
    next();
});

// tourSchema.post(/^find/, function (docs, next) {
//     // console.log(
//     //     `🚀 ~ 🚀 ~ Query took ${(Date.now() - this.start) / 10} seconds`,
//     // );
//     console.log(docs);
//     next();
// });

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
