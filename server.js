const mongoose = require('mongoose');
const app = require('./app');

require('dotenv').config();

process.on('unhandledRejection', (err) => {
    console.error('💥 ERROR:', err.name, err.message);
    console.log('UNHANDLED  REJECTION! Shutting down...');
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.log('UNHANDLED  REJECTION! Shutting down...');
    console.error('💥 ERROR:', err.name, err.message);
    process.exit(1);
});

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

const port = process.env.LOCAL_PORT || 4000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
