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
const swaggerUi = require('swagger-ui-express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const payRouter = require('./routes/payRoutes');
const AppError = require('./helpers/appError');
const handleError = require('./helpers/errorHandler');
const swaggerSpec = require('./utils/swagger');

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
app.use(cookieParser());

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
app.use(compression());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
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
