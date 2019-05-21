# yarn-m2-api-fastify

## Install :computer:
Make sure the .env file is filled correctly.

`yarn install`  

## .env :gear:
```dotenv
SERVICE_NAME=m2-api

PORT=3000

REDIS_HOST=127.0.0.1
REDIS_KEY_PREFIX=m2-api:

MEDIA_URL=https://stage-hofy.kidl.no/media/catalog/product

MAGENTO_ACCESS_TOKEN=Your magento api access token
MAGENTO_API_URL=https://stage-hofy.kidl.no
ATTRIBUTE_SETS={"16": "yarn", "17": "needles"}
PRODUCTS_PAGE_SIZE=5

CACHE=true

SLACK_WEBHOOK_URL
SLACK_CHANNEL

GA_TRACKING_ID=UA-1 ...
```

## Start :tada:

`yarn start`
