const environmentVariables = require('dotenv').config().parsed;
const checkEnvNotEmpty = require('./lib/checkEnvNotEmpty');
//checkEnvNotEmpty(environmentVariables);

const fastify = require('fastify')({logger: false});
const routes = require('./routes');
const slackNotify = require('./lib/slackNotify');

fastify.register(routes);

(async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);

    const slackNotify = require('./lib/slackNotify');

    process.exit(1);
  }
})();
