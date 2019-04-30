#!/bin/bash
env=( NODE_ENV PORT SERVICE_NAME JWT_SECRET MEDIA_URL MAGENTO_API_URL MAGENTO_ACCESS_TOKEN ATTRIBUTE_SETS PRODUCTS_PAGE_SIZE REDIS_HOST REDIS_KEY_PREFIX CACHE SLACK_WEBHOOK_URL SLACK_CHANNEL )

for i in "${env[@]}"
do
echo $i=${!i} >> .env
done

cat .env

npm run start
