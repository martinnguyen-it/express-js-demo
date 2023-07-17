const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'A user must have a name.'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email.'],
    },
    photo: {
        type: String,
        default: 'default-user.jpg',
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'guide', 'lead-guide', 'admin'],
    },
    password: {
        type: String,
        required: [true, 'Please provide your password.'],
        maxlength: [32, 'Password must have ≥ 8 and ≤ 32 characters.'],
        minlength: [8, 'Password must have ≥ 8 and ≤ 32 characters.'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password.'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match.',
        },
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpries: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// before create and save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function (
    candicatePassword,
    userPassword,
) {
    return await bcrypt.compare(candicatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
    if (this.passwordChangeAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10,
        );
        return changedTimeStamp > JWTTimeStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpries = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangeAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
