const pkg = require('./package.json');
require('dotenv').config();

module.exports = {
  swagger: '2.0',
  info: {
    description: pkg.description,
    version: pkg.version,
    title: 'yarn-m2-api-fastify',
    contact: {
      email: 'system@kidl.no',
    },
  },
  host: process.env.API_HOST,
  basePath: process.env.BASE_PATH,
  schemes: [
    'http',
  ],
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'x-access-token',
      in: 'header',
    },
  },
  definitions: {
    schemas: {
      NeedlesItem: {
        type: 'object',
        properties: {
          sku: {
            type: 'string',
            example: '100-35911',
          },
          enabled: {
            type: 'boolean',
            example: true,
          },
          name: {
            type: 'string',
            example: 'Basix Birch, 60 cm, 15.0 mm - Rundpinner i bjørk',
          },
          thickness: {
            type: 'string',
            example: '15',
          },
          length: {
            type: 'string',
            example: '60',
          },
          price: {
            type: 'number',
            example: 91,
          },
          price_merchant: {
            type: 'number',
            example: 91,
          },
          image: {
            type: 'object',
            properties: {
              swatch: {
                type: 'string',
                // eslint-disable-next-line max-len
                example: 'https://stage-hofy.kidl.no/media/catalog/product/1/0/100-35911_kp_basix_bj_rk_rundpinne_60cm__15mm.jpg',
              },
              base: {
                type: 'string',
                // eslint-disable-next-line max-len
                example: 'https://stage-hofy.kidl.no/media/catalog/product/1/0/100-35911_kp_basix_bj_rk_rundpinne_60cm__15mm.jpg',
              },
            },
          },
        },
      },
      Needles: {
        type: 'object',
        properties: {
          sku: {
            type: 'string',
            example: 'Basix Birch - Rundpinner',
          },
          enabled: {
            type: 'boolean',
            example: true,
          },
          name: {
            type: 'string',
            example: 'Rundpinner',
          },
          brand: {
            type: 'string',
            example: 'Basix Birch',
          },
          material: {
            type: 'string',
            example: 'Bjørk',
          },
          color: {
            type: 'string',
            example: 'Natur',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/definitions/schemas/NeedlesItem',
            },
          },
        },
      },
    },
  },
  externalDocs: {
    description: 'Find out more about service',
    url: 'https://kidlno.atlassian.net/wiki/spaces/HY/pages/24838147/Microservices+Woolit',
  },
};
