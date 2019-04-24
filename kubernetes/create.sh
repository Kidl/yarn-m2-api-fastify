#!/usr/bin/env bash

kubectl apply -f secret-dev.yaml
#kubectl apply -f secret-stage.yaml
#kubectl apply -f secret-prod.yaml

kubectl apply -f import.yaml
