#!/bin/bash

# Test Prometheus and Grafana monitoring stack in staging environment
# This script performs validation tests on the monitoring infrastructure

set -e

echo "Starting monitoring validation tests in staging environment..."

# Variables
NAMESPACE="monitoring-staging"
PROMETHEUS_SERVICE="prometheus"
GRAFANA_SERVICE="grafana"
TEST_DURATION=300  # 5 minutes for load testing

# Function to check if a pod is running
check_pod_status() {
  local label=$1
  local status=$(kubectl -n $NAMESPACE get pods -l $label -o jsonpath='{.items[0].status.phase}')

  if [ "$status" == "Running" ]; then
    echo "✅ Pod with label $label is running"
    return 0
  else
    echo "❌ Pod with label $label is not running (status: $status)"
    return 1
  fi
}

# Function to check if a service is available
check_service_status() {
  local service=$1

  if kubectl -n $NAMESPACE get service $service &> /dev/null; then
    echo "✅ Service $service exists"
    return 0
  else
    echo "❌ Service $service does not exist"
    return 1
  fi
}

# Function to test Prometheus API
test_prometheus_api() {
  echo "Testing Prometheus API..."

  # Start port-forwarding in the background
  kubectl -n $NAMESPACE port-forward svc/$PROMETHEUS_SERVICE 9090:9090 &
  PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Test API endpoints
  echo "Testing Prometheus API endpoints..."

  # Test /api/v1/status/config
  if curl -s http://localhost:9090/api/v1/status/config | grep -q "success"; then
    echo "✅ Prometheus config API check passed"
  else
    echo "❌ Prometheus config API check failed"
  fi

  # Test /api/v1/query with up metric
  if curl -s 'http://localhost:9090/api/v1/query?query=up' | grep -q "success"; then
    echo "✅ Prometheus query API check passed"
  else
    echo "❌ Prometheus query API check failed"
  fi

  # Test /api/v1/targets
  if curl -s http://localhost:9090/api/v1/targets | grep -q "success"; then
    echo "✅ Prometheus targets API check passed"
  else
    echo "❌ Prometheus targets API check failed"
  fi

  # Test /api/v1/rules
  if curl -s http://localhost:9090/api/v1/rules | grep -q "success"; then
    echo "✅ Prometheus rules API check passed"
  else
    echo "❌ Prometheus rules API check failed"
  fi

  # Kill port-forwarding
  kill $PF_PID
  wait $PF_PID 2>/dev/null || true
}

# Function to test Grafana API
test_grafana_api() {
  echo "Testing Grafana API..."

  # Start port-forwarding in the background
  kubectl -n $NAMESPACE port-forward svc/$GRAFANA_SERVICE 3000:3000 &
  PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Test API endpoints
  echo "Testing Grafana API endpoints..."

  # Test /api/health
  if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "✅ Grafana health API check passed"
  else
    echo "❌ Grafana health API check failed"
  fi

  # Test /api/datasources with admin credentials
  if curl -s -u admin:admin http://localhost:3000/api/datasources | grep -q "Prometheus" 2>/dev/null; then
    echo "✅ Grafana datasources API check passed"
  else
    echo "❌ Grafana datasources API check failed"
  fi

  # Kill port-forwarding
  kill $PF_PID
  wait $PF_PID 2>/dev/null || true
}

# Function to validate Prometheus targets
validate_prometheus_targets() {
  echo "Validating Prometheus targets..."

  # Start port-forwarding in the background
  kubectl -n $NAMESPACE port-forward svc/$PROMETHEUS_SERVICE 9090:9090 &
  PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Get targets and check for any down targets
  local down_targets=$(curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | select(.health != "up") | .labels.job')

  if [ -z "$down_targets" ]; then
    echo "✅ All Prometheus targets are up"
  else
    echo "❌ Some Prometheus targets are down: $down_targets"
  fi

  # Kill port-forwarding
  kill $PF_PID
  wait $PF_PID 2>/dev/null || true
}

# Function to validate Prometheus rules
validate_prometheus_rules() {
  echo "Validating Prometheus rules..."

  # Start port-forwarding in the background
  kubectl -n $NAMESPACE port-forward svc/$PROMETHEUS_SERVICE 9090:9090 &
  PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Get rules and check for any invalid rules
  local invalid_rules=$(curl -s http://localhost:9090/api/v1/rules | jq -r '.data.groups[] | .rules[] | select(.health != "ok") | .name')

  if [ -z "$invalid_rules" ]; then
    echo "✅ All Prometheus rules are valid"
  else
    echo "❌ Some Prometheus rules are invalid: $invalid_rules"
  fi

  # Kill port-forwarding
  kill $PF_PID
  wait $PF_PID 2>/dev/null || true
}

# Function to validate metrics collection
validate_metrics_collection() {
  echo "Validating metrics collection..."

  # Start port-forwarding in the background
  kubectl -n $NAMESPACE port-forward svc/$PROMETHEUS_SERVICE 9090:9090 &
  PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Check for essential metrics
  local metrics=(
    "up"
    "node_cpu_seconds_total"
    "node_memory_MemAvailable_bytes"
    "node_filesystem_avail_bytes"
    "container_cpu_usage_seconds_total"
    "container_memory_usage_bytes"
    "http_requests_total"
  )

  for metric in "${metrics[@]}"; do
    if curl -s "http://localhost:9090/api/v1/query?query=$metric" | jq -e '.data.result | length > 0' > /dev/null; then
      echo "✅ Metric $metric is being collected"
    else
      echo "❌ Metric $metric is not being collected"
    fi
  done

  # Kill port-forwarding
  kill $PF_PID
  wait $PF_PID 2>/dev/null || true
}

# Function to test network policies
test_network_policies() {
  echo "Testing network policies..."

  # Create a temporary pod in the default namespace
  kubectl run network-policy-test --image=curlimages/curl --restart=Never -- sleep 3600

  # Wait for pod to be ready
  kubectl wait --for=condition=Ready pod/network-policy-test --timeout=60s

  # Try to access Prometheus from outside the namespace (should fail)
  echo "Testing access from outside the namespace (should fail)..."
  if kubectl exec network-policy-test -- curl -s --connect-timeout 5 http://$PROMETHEUS_SERVICE.$NAMESPACE.svc:9090/api/v1/status/config; then
    echo "❌ Network policy test failed: Prometheus is accessible from outside the namespace"
  else
    echo "✅ Network policy test passed: Prometheus is not accessible from outside the namespace"
  fi

  # Clean up
  kubectl delete pod network-policy-test --force --grace-period=0
}

# Function to perform load testing
perform_load_testing() {
  echo "Performing load testing for $TEST_DURATION seconds..."

  # Create a temporary pod for load testing
  kubectl run load-test --image=pstauffer/curl-jq --restart=Never -n $NAMESPACE -- sleep $TEST_DURATION

  # Wait for pod to be ready
  kubectl wait --for=condition=Ready pod/load-test -n $NAMESPACE --timeout=60s

  # Start load testing in the background
  kubectl exec -n $NAMESPACE load-test -- /bin/sh -c "while true; do curl -s http://$PROMETHEUS_SERVICE:9090/api/v1/query?query=up >/dev/null; sleep 0.1; done" &
  LOAD_PID=$!

  echo "Load test running for $TEST_DURATION seconds..."
  sleep $TEST_DURATION

  # Kill load testing
  kill $LOAD_PID 2>/dev/null || true

  # Check resource usage during load
  echo "Checking resource usage after load test:"
  kubectl top pod -n $NAMESPACE

  # Clean up
  kubectl delete pod load-test --force --grace-period=0 -n $NAMESPACE
}

# Function to validate access controls
validate_access_controls() {
  echo "Validating access controls..."

  # Start port-forwarding for Prometheus in the background
  kubectl -n $NAMESPACE port-forward svc/$PROMETHEUS_SERVICE 9090:9090 &
  PROM_PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Check if authentication is required
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/api/v1/status/config | grep -q "401\|403"; then
    echo "✅ Prometheus authentication is enabled"
  else
    echo "❌ Prometheus authentication is not enabled"
  fi

  # Kill port-forwarding
  kill $PROM_PF_PID
  wait $PROM_PF_PID 2>/dev/null || true

  # Start port-forwarding for Grafana in the background
  kubectl -n $NAMESPACE port-forward svc/$GRAFANA_SERVICE 3000:3000 &
  GRAFANA_PF_PID=$!

  # Wait for port-forwarding to establish
  sleep 5

  # Check if authentication is required
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboards/home | grep -q "401\|403"; then
    echo "✅ Grafana authentication is enabled"
  else
    echo "❌ Grafana authentication is not enabled"
  fi

  # Kill port-forwarding
  kill $GRAFANA_PF_PID
  wait $GRAFANA_PF_PID 2>/dev/null || true
}

# Main test execution
echo "Running infrastructure tests..."
check_pod_status "app=prometheus,component=server"
check_service_status "$PROMETHEUS_SERVICE"
check_pod_status "app=grafana"
check_service_status "$GRAFANA_SERVICE"

echo "Running API tests..."
test_prometheus_api
test_grafana_api

echo "Running validation tests..."
validate_prometheus_targets
validate_prometheus_rules
validate_metrics_collection
test_network_policies
validate_access_controls

echo "Running performance tests..."
perform_load_testing

echo "All tests completed!"
