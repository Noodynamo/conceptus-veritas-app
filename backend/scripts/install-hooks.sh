#!/bin/bash

# Script to install git hooks
# This script copies hooks from .github/hooks to .git/hooks

# Ensure we're in the root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR" || exit 1

echo "Installing git hooks..."

# Ensure the hooks directory exists
mkdir -p .git/hooks

# Copy all hooks and make them executable
for hook in .github/hooks/*; do
  if [ -f "$hook" ]; then
    hook_name=$(basename "$hook")
    echo "Installing $hook_name hook"
    cp "$hook" ".git/hooks/$hook_name"
    chmod +x ".git/hooks/$hook_name"
  fi
done

echo "Git hooks installed successfully!" 