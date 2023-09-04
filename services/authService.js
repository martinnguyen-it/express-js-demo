// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Email = require('../utils/email');

module.exports = class authService {
    static async signup(data) {
        const newUser = await User.create(data);
        const url = `${process.env.FE_REACT_URL}/me`;
        await new Email(newUser, url).sendWelcome();
    }

    static signToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    }

    static async createSendToken(user, statusCode, res) {
        const token = this.signToken(user.id);

        // const cookieOptions = {
        //     expires: new Date(
        //         Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        //     ),
        //     httpOnly: true,
        // };

        // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

        // res.cookie('jwt', token, cookieOptions);

        user.password = undefined;
        res.status(statusCode).json({
            status: 'success',
            token,
            data: { user },
        });
    }
};
