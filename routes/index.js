const checkAccess = require('../middleware/checkAccess');
const magento = require('../controllers/magento');
const cache = require('../lib/cache');

async function routes (fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/type/:productType',
    schema: {
      params: {
        productType: {
          type: 'string',
          enum: ['yarn', 'needles'],
        },
      },
    },
    querystring: {
      currentPage: {
        type: 'integer',
        minimum: 0,
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => {
      let discount = 0;

      if (request.req && request.req.user && request.req.user.options && request.req.user.options.discount) {
        discount = request.req.user.options.discount;
      }

      return await magento.getProductsByType(request.params.productType, request.query.currentPage, discount);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/:sku',
    schema: {
      params: {
        sku: {
          type: 'string',
          pattern: '^\\d{3}-\\d{2,6}\\w{0,2}$'
        },
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => {
      return await magento.getConfigurableProductBySku(request.params.sku);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/attribute/:name/:id',
    schema: {
      params: {
        sku: {
          type: 'string',
        },
      },
    },
    preHandler: checkAccess,
    handler: async (request, reply) => {
      return await magento.getAttributeValue(request.params.name, request.params.id);
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/cache/all',
    preHandler: checkAccess,
    handler: async (request, reply) => {
      return await cache.deleteAll();
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/cache/:sku',
    schema: {
      params: {
        sku: {
          type: 'string',
          pattern: '^\\d{3}-\\d{2,6}\\w{0,2}$'
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
