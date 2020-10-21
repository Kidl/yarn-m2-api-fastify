const checkAccess = require('@kidl/express-auth-middleware')();
const magento = require('../controllers/magento');
const cache = require('../lib/cache');
const attributeSet = require('../lib/attributeSet');

async function routes(fastify, options) {
  /** @swagger
    "/products/type/{productType}": {
      "get":  {
        "tags": [
          "products"
        ],
        "summary": "getProductsByType",
        "description": "Find products by productType",
        "operationId": "getProductsByType",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "productType",
            "in": "path",
            "description": "Type of products to return",
            "required": true,
            "type": "string"
          },
          {
            "name": "currentPage",
            "in": "query",
            "description": "Paging",
            "required": false,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              type: 'array',
              items: {
                "$ref": "#/definitions/schemas/Needles"
              }
            }
          },
          "400": {
            "description": "Bad request"
          }
        },
        "security": [
          {
            "jwt": ["apiKey"]
          }
        ]
      }
    }
  */
  fastify.route({
    method: 'GET',
    url: '/products/type/:productType',
    schema: {
      params: {
        productType: {
          type: 'string',
          enum: Object.keys(attributeSet.str2obj(process.env.ATTRIBUTE_SETS)),
        },
      },
    },
    querystring: {
      currentPage: {
        type: 'integer',
        minimum: 1,
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => {
      let discount = 0;

      if (request.user && request.user.options && request.user.options.discount) {
        discount = request.user.options.discount;
      }

      const currentPage = request.query.currentPage ? request.query.currentPage : 1;

      let products = await magento.getProductsByType(request.params.productType, currentPage);
      products = magento.addDiscount(products, discount);

      return products;
    },
  });

  /** @swagger
    "/products/{sku}": {
      "get":  {
        "tags": [
          "products"
        ],
        "summary": "getConfigurableProductBySku",
        "description": "Find product by sku",
        "operationId": "getConfigurableProductBySku",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "sku",
            "in": "path",
            "description": "sku of product to return",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/schemas/NeedlesItem"
            }
          },
          "400": {
            "description": "Bad request"
          }
        },
        "security": [
          {
            "jwt": ["apiKey"]
          }
        ]
      }
    }
  */
  fastify.route({
    method: 'GET',
    url: '/products/:sku',
    // preHandler: checkAccess,
    handler: async (request, reply) => {

        console.log('request.params.sku : ', request.params.sku);
      let discount = 0;

      if (request.user && request.user.options && request.user.options.discount) {
        discount = request.user.options.discount;
      }

      let product = await magento.getProductBySku(request.params.sku);
      product = magento.addDiscount(product, discount);

      return product;
    },
  });

  /** @swagger
    "/products/attribute/{name}/{id}": {
      "get":  {
        "tags": [
          "products"
        ],
        "summary": "getAttributeValue",
        "description": "getAttributeValue",
        "operationId": "getAttributeValue",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "name",
            "in": "path",
            "description": "name",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "description": "id",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad request"
          }
        },
        "security": [
          {
            "jwt": ["apiKey"]
          }
        ]
      }
    }
  */
  fastify.route({
    method: 'GET',
    url: '/products/attribute/:name/:id',
    schema: {
      params: {
        sku: {
          type: 'string',
        },
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => await magento.getAttributeValue(request.params.name, request.params.id),
  });

  /** @swagger
    "/products/cache/all": {
      "delete": {
        "tags": [
          "cache"
        ],
        "summary": "deleteAll",
        "description": "Delete all the cache",
        "operationId": "deleteAll",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "examples": {
              "applicatins/json": [
                "getAttributeValue[\"thickness\",\"9051\"]",
                "getAttributeValue[\"brand\",\"9371\"]",
                "getAttributes[]",
                "getConfigurableProductBySku[\"Basix Birch - Parpinner\"]",
                "getAttributesByName[\"needle_length\"]",
                "getAttributeValue[\"thickness\",\"479\"]",
                "getAttributeValue[\"thickness\",\"475\"]",
              ]
            }
          }
        },
        "security": [
          {
            "jwt": ["apiKey"]
          }
        ]
      }
    }
  */
  fastify.route({
    method: 'DELETE',
    url: '/products/cache/all',
    preHandler: checkAccess,
    handler: async (request, reply) => await cache.deleteAll(),
  });


  /** @swagger
    "/products/cache/{sku}": {
      "delete": {
        "tags": [
          "cache"
        ],
        "summary": "del",
        "description": "Deletes product cache by sku",
        "operationId": "del",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "sku",
            "in": "path",
            "description": "sku of product cache to delete",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "examples": {
              "application/json": [
                "getProductBySku[\"Gjestal - Vestlandsgarn\"]"
              ]
            }
          },
          "400": {
            "description": "Bad request"
          }
        },
        "security": [
          {
            "jwt": ["apiKey"]
          }
        ]
      }
    }
  */
  fastify.route({
    method: 'DELETE',
    url: '/products/cache/:sku',
    schema: {
      params: {
        sku: {
          type: 'string',
        },
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => {
      const key = cache.getKey(magento.getProductBySku, [request.params.sku]);
      return await cache.del(null, key);
    },
  });

  fastify.get('/doc', (req, reply) => {
    reply.sendFile('redoc-static.html');
  });
}

module.exports = routes;
