const User = require('../models/userModel');
const AppError = require('../helpers/appError');
const catchAsync = require('../utils/catchAsync');
const { filterObj } = require('../utils');
const userService = require('../services/userService');

exports.getAllUsers = userService.getAll(User);

exports.getUser = userService.getOne(User);

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined',
    });
};

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined',
    });
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('This route is not define for password updates.', 400),
        );
    }

    const valueUpdate = filterObj(req.body, 'email', 'name');
    if (req.file) valueUpdate.photo = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user.id, valueUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ status: 'success', data: user });
});

exports.deleteUser = userService.deleteOne(User);

// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined',
//     });
// };

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false,
    });

    res.status(204).json({ status: 'success', data: null });
});
