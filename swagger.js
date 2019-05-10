module.exports = {
  "swagger": "2.0",
  "info": {
    "description": "yarn-m2-api-fastify service",
    "version": "0.0.1",
    "title": "yarn-m2-api-fastify",
    "contact": {
      "email": "system@kidl.no"
    }
  },
  "host": "yarn-m2-api-fastify",
  "basePath": "/",
  "schemes": [
    "http"
  ],
  "securityDefinitions": {
    "jwt": {
      "type": "apiKey",
      "name": "x-access-token",
      "in": "header"
    }
  },
  "externalDocs": {
    "description": "Find out more about service",
    "url": "https://kidlno.atlassian.net/wiki/spaces/HY/pages/24838147/Microservices+Woolit"
  }
};
