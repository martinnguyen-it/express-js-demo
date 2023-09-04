const mongoose = require('mongoose');
require('dotenv').config();

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

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
