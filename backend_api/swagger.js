const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'A simple Express API documented with Swagger'
    },
    tags: [
      { name: 'Health', description: 'Service health endpoints' },
      { name: 'Auth', description: 'User registration and authentication' },
      { name: 'Products', description: 'Product catalog management' },
      { name: 'Orders', description: 'Order placement and history' }
    ]
  },
  apis: ['./src/routes/**/*.{js,ts}'] // include TS routes after migration
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
