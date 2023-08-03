const app = require('./app');

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

require('./mongoDB/config');

const port = process.env.PORT || process.env.LOCAL_PORT || 4000;
app.listen(port, '0.0.0.0', () => {
    console.log(`listening on port ${port}`);
});
