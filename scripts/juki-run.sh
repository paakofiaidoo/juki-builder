#!/bin/bash

# juki-run.sh
# Orchestrates the Juki development environment.

set -e

# Ensure we are in the root directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "🚀 Starting Juki..."

# 1. Generate Protos
echo "🛠️  Generating Protobufs..."
if [ -x "./scripts/gen-protos.sh" ]; then
    ./scripts/gen-protos.sh
else
    echo "⚠️  scripts/gen-protos.sh not found or not executable. Skipping."
fi

# 2. Run Dev Servers
# We use pnpm to execute the concurrently command and the individual dev scripts defined in package.json
# This keeps the specific run commands (air, next dev) managed in package.json/package.json scripts where developers expect them.
echo "🟢 Starting Engine and Editor..."
# Using npx or pnpm exec to ensure we find the local binary
pnpm exec concurrently "pnpm dev:engine" "pnpm dev:editor"