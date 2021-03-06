#!/bin/bash

#
# Use the Minikube Docker Daemon rather than that of Docker Desktop for Mac
#
minikube profile api
eval $(minikube docker-env)
if [ $? -ne 0 ];
then
  echo "Minikube problem encountered - please ensure that the service is started"
  exit 1
fi

#
# Build the SPA's code
#
cd ../../spa
npm install
npm run buildRelease
if [ $? -ne 0 ]
then
  echo "SPA build problem encountered"
  exit 1
fi

#
# Build the Web Host's code
#
cd ../webhost
npm install
npm run buildRelease
if [ $? -ne 0 ]
then
  echo "Web Host build problem encountered"
  exit 1
fi

#
# Build the Web Host's docker image
#
cd ..
docker build --no-cache -f deployment/kubernetes/Dockerfile -t webhost:v1 .
if [ $? -ne 0 ]
then
  echo "Web Host docker build problem encountered"
  exit 1
fi

#
# Issue an internal SSL certificate for the Web Host and a secret for its private key password
# Files issued are then present in the data output of this command:
# - kubectl get certificate webhost-svc-internal-cert -o yaml
#
kubectl delete secret webhost-pkcs12-password 2>/dev/null
kubectl create secret generic webhost-pkcs12-password --from-literal=password='Password1'
kubectl apply -f deployment/kubernetes/internal-cert.yaml
if [ $? -ne 0 ]
then
echo "Web Host internal certificate problem encountered"
  exit 1
fi

#
# Deploy the Web Host to the cluster
#
kubectl delete deploy/webhost       2>/dev/null
kubectl delete service/webhost-svc  2>/dev/null
kubectl apply -f deployment/kubernetes/service.yaml
if [ $? -ne 0 ]
then
  echo "Web Host service deployment problem encountered"
  exit 1
fi

#
# Expose the Web Host on the Developer PC
#
kubectl apply -f deployment/kubernetes/ingress.yaml
if [ $? -ne 0 ]
then
  echo "Web Host ingress problem encountered"
  exit 1
fi
