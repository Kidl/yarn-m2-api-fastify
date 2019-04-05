const checkAccess = require('../middleware/checkAccess');
const magento = require('../controllers/magento');
const cache = require('../lib/cache');

async function routes (fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/type/:productType',
    //preHandler: checkAccess,
    handler: async (request, reply) => {
      return await magento.getProductsByType(request.params.productType, request.query.currentPage);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/:sku',
    //preHandler: checkAccess,
    handler: async (request, reply) => {
      return await magento.getProductsBySku(request.params.sku);
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/cache/all',
    //preHandler: checkAccess,
    handler: async (request, reply) => {
      return await cache.deleteAll();
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/cache/:sku',
    //preHandler: checkAccess,
    handler: async (request, reply) => {
      const key = cache.getKey(magento.getProductsBySku, [request.params.sku]);
      return await cache.del(null, key);
    },
  });
}

module.exports = routes;
