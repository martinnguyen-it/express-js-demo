const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const payRouter = require('./routes/payRoutes');
const AppError = require('./utils/appError');
const handleError = require('./controllers/errorController');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'REST API Documentation',
        },
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: 'http',
                    schema: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js', './utils/swagger/*.js'],
};
const swaggerSpec = swaggerJsdoc(options);

// use it before all route definitions
const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({ origin: '*' }));

app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// LIMIT REQUEST
const limiter = rateLimit({
    max: 20,
    windowMs: 10 * 1000,
    message: 'Too many requests from your IP address.',
});

app.use('/api', limiter);

// Body parser, parse JSON from req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssClean());

app.use(
    hpp({
        whitelist: 'duration',
    }),
);

// app.use('/', (req, res) => {
//     res.status(200).render('base');
// });

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/pay', payRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't not find ${req.originalUrl} on this server!`,
    // });

    // const err = new Error(`Can't not find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(
        new AppError(`Can't not find ${req.originalUrl} on this server!`, 404),
    );
});

app.use(handleError);

module.exports = app;
