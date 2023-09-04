const AppError = require('./appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const message = `Duplicate field value: '${err.keyValue.name}'. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join(' ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => {
    const message = `Ivalid token.`;
    return new AppError(message, 401);
};

const handleJWTTokenExpiredError = () => {
    const message = `Token expired.`;
    return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // Programming or other unknown error: don't leak error details
    } else {
        console.error('ERROR 💥:', err);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong.',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'production') {
        let error = { ...err, name: err.name };

        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError')
            error = handleJWTTokenExpiredError(error);

        if (Number(error.code) === 11000)
            error = handleDuplicateFieldsDB(error);
        sendErrorProd(error, res);
    } else if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
};
