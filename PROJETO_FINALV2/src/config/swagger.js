const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GREENHERB API',
      version: '1.0.0',
      description: 'API REST para gestão inteligente de estufa de ervas aromáticas — Sprint 1',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor de desenvolvimento' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduza o token JWT obtido em POST /auth/login',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
