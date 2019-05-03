const checkAccess = require('@kidl.no/express-auth-middleware')();
const magento = require('../controllers/magento');
const cache = require('../lib/cache');

async function routes(fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/products/type/:productType',
    schema: {
      params: {
        productType: {
          type: 'string',
          enum: Object.keys(JSON.parse(process.env.ATTRIBUTE_SETS)),
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

      const currentPage =  request.query.currentPage ? request.query.currentPage : 1;

      return await magento.getProductsByType(request.params.productType, currentPage, discount);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/products/:sku',
    preHandler: checkAccess,
    handler: async (request, reply) => await magento.getConfigurableProductBySku(request.params.sku),
  });

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

  fastify.route({
    method: 'DELETE',
    url: '/products/cache/all',
    preHandler: checkAccess,
    handler: async (request, reply) => await cache.deleteAll(),
  });

  fastify.route({
    method: 'DELETE',
    url: '/products/cache/:sku',
    schema: {
      params: {
        sku: {
          type: 'string',
          pattern: '^\\d{3}-\\d{2,6}\\w{0,2}$',
        },
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => {
      const key = cache.getKey(magento.getProductBySku, [request.params.sku]);
      return await cache.del(null, key);
    },
  });
}

module.exports = routes;
