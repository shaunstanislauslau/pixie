#!/bin/bash

bazel run src/stirling/socket_tracer/protocols/http/testing/go_http_client:push_image
bazel run src/stirling/socket_tracer/protocols/http/testing/go_http_server:push_image

namespace_name="px-http-test"

kubectl create namespace "${namespace_name}"

kubectl --namespace "${namespace_name}" create secret docker-registry image-pull-secret \
  --docker-server=https://gcr.io \
  --docker-username=_json_key \
  --docker-email="${USER}@pixielabs.ai" \
  --docker-password="$(sops -d credentials/k8s/dev/image-pull-secrets.encrypted.json)" \
  --dry-run=true --output=yaml | kubectl apply -f -

sed "s/{{USER}}/${USER}/" src/stirling/socket_tracer/protocols/http/testing/go_http_server/deployment.yaml | \
  kubectl apply -f -
sed "s/{{USER}}/${USER}/" src/stirling/socket_tracer/protocols/http/testing/go_http_client/deployment.yaml | \
  kubectl apply -f -