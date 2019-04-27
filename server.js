const environmentVariables = require('dotenv').config().parsed;
const fastify = require('fastify')({ logger: true });
const checkEnvNotEmpty = require('./lib/checkEnvNotEmpty');
const routes = require('./routes');
const slackNotify = require('./lib/slackNotify');

if(environmentVariables !== undefined){
    checkEnvNotEmpty(environmentVariables);
}else{
    console.log('Run application without .env');
}

fastify.register(require('fastify-healthcheck'), { healthcheckUrl: '/healthcheck' });
fastify.register(routes);

(async () => {
  try {
    await fastify.listen(process.env.PORT);
  } catch (err) {
    fastify.log.error(err);

    slackNotify(err.toString());

    process.exit(1);
  }
})();
