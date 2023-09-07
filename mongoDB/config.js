const mongoose = require('mongoose');
require('dotenv').config();

// eslint-disable-next-line no-unused-vars
const DB =
    process.env.NODE_ENV !== 'test'
        ? process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)
        : process.env.DB_LOCAL;

mongoose
    // .connect(process.env.DB_LOCAL, {
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
    })
    .then(() => {
        console.log('🚀 ~ DB connection established');
    });
