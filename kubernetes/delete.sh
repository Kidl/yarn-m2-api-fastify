#!/usr/bin/env bash

kubectl delete -f secret-dev.yaml
#kubectl delete -f secret-stage.yaml
#kubectl delete -f secret-prod.yaml

kubectl delete -f import.yaml
