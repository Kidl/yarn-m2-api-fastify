'use strict';

/* eslint-disable no-process-exit */

const environmentVariables = require('dotenv').config().parsed;
const fastify = require('fastify')({ logger: process.env.LOGGER });
const GoogleAnalyticsTracker = require('@kidl.no/google-analytics-tracking');
const checkEnvNotEmpty = require('./lib/checkEnvNotEmpty');
const routes = require('./routes');
const slackNotify = require('./lib/slackNotify');

const host = process.env.HOST || '127.0.0.1';

if (environmentVariables !== undefined) {
  checkEnvNotEmpty(environmentVariables);
} else {
  console.log('Run application without .env');
}

const track = new GoogleAnalyticsTracker(process.env.GA_TRACKING_ID, process.env.SERVICE_NAME, console.error);

fastify.register(require('fastify-static'), { root: __dirname });
fastify.register(require('fastify-healthcheck'), { healthcheckUrl: '/healthcheck' });

fastify.use(track);
fastify.register(routes);

(async () => {
  try {
    await fastify.listen(process.env.PORT, host, (err) => {
      if (err) {
        fastify.log.error(err);
        console.log(err);
        process.exit(1);
      }
      fastify.log.info('Server Started');
    });
  } catch (err) {
    fastify.log.error(err);

    slackNotify(err.toString());

    process.exit(1);
  }
})();
