#!/bin/bash

env=( NODE_ENV PORT SERVICE_NAME JWT_SECRET CRYPTO_SECRET MEDIA_URL MAGENTO_API_URL MAGENTO_ACCESS_TOKEN ATTRIBUTE_SETS PRODUCTS_PAGE_SIZE REDIS_HOST REDIS_KEY_PREFIX CACHE SLACK_WEBHOOK_URL SLACK_CHANNEL GA_TRACKING_ID )

echo '//registry.npmjs.org/:_authToken='${NPM_TOKEN} > .npmrc

for i in "${env[@]}"
do
printf $i=${!i} >> .env
done
rm -rf .env

printenv
