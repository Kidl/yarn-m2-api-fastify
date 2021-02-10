module.exports = {
  apps: [
    {
      name: 'yarn-m2-api-fastify',
      script: 'yarn start',
      watch: false,
      autorestart: true,
      max_memory_restart: '2G',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
