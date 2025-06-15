#!/bin/bash

# Rollback Prometheus deployment in staging environment
# This script reverts the Prometheus deployment to a known good state

set -e

echo "Starting rollback of Prometheus deployment in staging environment..."

# Variables
NAMESPACE="monitoring-staging"
BACKUP_DIR="./k8s/monitoring/backups/$(date +%Y%m%d)"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to backup a resource
backup_resource() {
  local resource_type=$1
  local resource_name=$2

  echo "Backing up $resource_type/$resource_name..."
  kubectl -n $NAMESPACE get $resource_type $resource_name -o yaml > "$BACKUP_DIR/${resource_type}_${resource_name}.yaml"
}

# Function to check if a resource exists
resource_exists() {
  local resource_type=$1
  local resource_name=$2

  kubectl -n $NAMESPACE get $resource_type $resource_name &> /dev/null
}

# Backup current state
echo "Creating backups of current state..."
if resource_exists "statefulset" "prometheus"; then
  backup_resource "statefulset" "prometheus"
fi

if resource_exists "service" "prometheus"; then
  backup_resource "service" "prometheus"
fi

if resource_exists "configmap" "prometheus-config"; then
  backup_resource "configmap" "prometheus-config"
fi

if resource_exists "configmap" "prometheus-rules"; then
  backup_resource "configmap" "prometheus-rules"
fi

# Delete resources in reverse order
echo "Deleting resources in reverse order..."
if resource_exists "service" "prometheus"; then
  echo "Deleting service/prometheus..."
  kubectl -n $NAMESPACE delete service prometheus --ignore-not-found
fi

if resource_exists "statefulset" "prometheus"; then
  echo "Deleting statefulset/prometheus..."
  kubectl -n $NAMESPACE delete statefulset prometheus --ignore-not-found
fi

if resource_exists "configmap" "prometheus-rules"; then
  echo "Deleting configmap/prometheus-rules..."
  kubectl -n $NAMESPACE delete configmap prometheus-rules --ignore-not-found
fi

if resource_exists "configmap" "prometheus-config"; then
  echo "Deleting configmap/prometheus-config..."
  kubectl -n $NAMESPACE delete configmap prometheus-config --ignore-not-found
fi

# Keep network policies and RBAC for security reasons
echo "Note: Network policies and RBAC configurations are preserved for security reasons."

# Wait for resources to be deleted
echo "Waiting for resources to be deleted..."
while resource_exists "statefulset" "prometheus"; do
  echo "Waiting for statefulset/prometheus to be deleted..."
  sleep 5
done

echo "Rollback completed successfully!"
echo "The monitoring stack has been rolled back to a clean state."
echo "To restore from a previous version, apply the manifests from the appropriate backup directory."
echo "Backup files are stored in: $BACKUP_DIR"
