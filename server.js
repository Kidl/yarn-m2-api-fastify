const environmentVariables = require('dotenv').config().parsed;
const checkEnvNotEmpty = require('./lib/checkEnvNotEmpty');
//checkEnvNotEmpty(environmentVariables);

const fastify = require('fastify')({logger: false});
const routes = require('./routes');
fastify.register(routes);

(async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
})();
