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

    static signAccessToken(id) {
        return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_EXPIRES_IN,
        });
    }

    static signRefreshToken(id) {
        return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_EXPIRES_IN,
        });
    }

    static login(user, statusCode, res) {
        const token = {
            access_token: this.signAccessToken(user.id),
            refresh_token: this.signRefreshToken(user.id),
        };

        const cookieOptions = {
            expires: new Date(
                Date.now() +
                    process.env.COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000,
            ),
            httpOnly: true,
            sameSite: 'None',
        };

        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

        res.cookie('jwt', token.refresh_token, cookieOptions);

        user.password = undefined;
        res.status(statusCode).json({
            status: 'success',
            access_token: token.access_token,
            data: { user },
        });
    }

    static async createSendToken(user, statusCode, res) {
        const token = await this.signAccessToken(user.id);
        res.status(statusCode).json({
            access_token: token,
        });
    }
};
