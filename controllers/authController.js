const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // const cookieOptions = {
    //     expires: new Date(
    //         Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    //     ),
    //     httpOnly: true,
    // };

    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
    req.body.role = undefined;
    const newUser = await User.create(req.body);
    const url = `${process.env.FE_REACT_URL}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password.', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    const correct =
        !!user && (await user.correctPassword(password, user.password));

    if (!correct) {
        return next(new AppError('Incorrect email or password.', 401));
    }

    createSendToken(user, 200, res);
});

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with that email.', 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FE_REACT_URL}/auth/reset-password/${resetToken}`;

    // const resetURL = `${req.protocol}://${req.get(
    //     'host',
    // )}/api/users/reset-password/${resetToken}`;
    // const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}.\nIf you didn't  forget your password, please ignore this email.`;

    try {
        await new Email(user, url).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to your email.',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpries = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError(
                'There was an error sending the email. Please try again later.',
                500,
            ),
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpries: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // user.passwordChangeAt = Date.now();
    user.passwordResetExpries = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
    if (!req.body.password || !req.body.newPassword) {
        return next(new AppError('Invalid.', 404));
    }

    if (req.body.password === req.body.newPassword) {
        return next(new AppError('New and old passwords are the same.', 401));
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return next(new AppError('No user found with that ID.', 404));
    }

    const correct = await user.correctPassword(
        req.body.password,
        user.password,
    );

    if (!correct) {
        return next(new AppError('Incorrect password.', 401));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    createSendToken(user, 200, res);
});
