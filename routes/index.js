const checkAccess = require('../middleware/checkAccess');
const magento = require('../controllers/magento');

async function routes (fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/:productType',
    //preHandler: checkAccess,
    handler: async (request, reply) => {
      return await magento.getProducts(request.params.productType, request.query.currentPage);
    },
  });
}

module.exports = routes;
