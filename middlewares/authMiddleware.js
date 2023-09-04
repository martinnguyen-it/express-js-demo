const jwt = require('jsonwebtoken');
const AppError = require('../helpers/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Your are not logged in.', 401));
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new AppError('Invalid token.', 401));
    }

    if (user.passwordChangedAfter(decoded.iat)) {
        return next(new AppError('Token is invalid or has expired.', 400));
    }
    req.user = user;

    next();
});

exports.redirectTo =
    (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission.', 403));
        }
        next();
    };
