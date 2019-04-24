#!/usr/bin/env bash

sed -i -e 's|{{NPM_TOKEN}}|'${NPM_TOKEN}'|g' .npmrc.template > .npmrc
npm i


if [ "${TRAVIS_BRANCH}" = "dev" ] || [ "${TRAVIS_BRANCH}" = "stage" ]; then
    service_account="google-cloud-credentials-dev-stage.json"
    google_cloud_project_id=${GOOGLE_CLOUD_PROJECT_ID_DEV}
    branch_alias=${TRAVIS_BRANCH}
else
    service_account="google-cloud-credentials-prod.json"
    google_cloud_project_id=${GOOGLE_CLOUD_PROJECT_ID_PROD}
    branch_alias=prod
fi

google_cloud_cluster_env_name="GOOGLE_CLOUD_CLUSTER_$(echo ${branch_alias} | awk '{print toupper($0)}')"

gcloud auth activate-service-account --key-file=${service_account};
gcloud config set compute/zone ${GOOGLE_CLOUD_COMPUTE_ZONE}
gcloud config set project ${google_cloud_project_id}
gcloud container clusters get-credentials ${!google_cloud_cluster_env_name}
docker login -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}
docker build -t ${IMAGE} -t ${REPO}:${branch_alias} .
docker push ${REPO}

kubectl apply -f kubernetes/secret-${branch_alias}.yaml
kubectl apply -f kubernetes/import.yaml

kubectl set image deployment/${CONTAINER_NAME} ${CONTAINER_NAME}=${IMAGE}
