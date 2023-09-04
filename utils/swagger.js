const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'REST API Documentation',
        },
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: 'http',
                    schema: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./utils/swaggerApis/*.js'],
};

module.exports = swaggerJsdoc(options);
