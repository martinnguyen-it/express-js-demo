const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
require('dotenv').config();

const mongoDB = {
    mongoose,
    connect: (done) => {
        mongoose.Promise = Promise;
        mongoose.connect(process.env.DB_LOCAL);
        done();
    },
    disconnect: (done) => {
        mongoose.connection.close();
        done();
    },
};

beforeAll((done) => {
    mongoDB.connect(done);
});

afterAll((done) => {
    mongoDB.disconnect(done);
});

describe('Test the root path', () => {
    it('should return 10 reviewws', async () => {
        const res = await request(server).get('/api/v1/reviews/');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(10);
    });
});
