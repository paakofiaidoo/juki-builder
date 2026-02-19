#!/bin/bash

# setup-project.sh
# Checks for required tools (brew, node, pnpm, go) and installs dependencies.

set -e

echo "🚀 Starting Juki Project Setup..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check for Homebrew (macOS)
if ! command_exists brew; then
    echo "❌ Homebrew not found. Please install Homebrew first: https://brew.sh/"
    echo "   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
else
    echo "✅ Homebrew found."
fi

# 2. Check for Node.js
if ! command_exists node; then
    echo "⚠️  Node.js not found. Installing via Homebrew..."
    brew install node
else
    echo "✅ Node.js found ($(node -v))."
fi

# 3. Check for dependent package manager: pnpm
if ! command_exists pnpm; then
    echo "⚠️  pnpm not found. Installing globally via npm..."
    npm install -g pnpm
else
    echo "✅ pnpm found ($(pnpm -v))."
fi

# 4. Check for Go
if ! command_exists go; then
    echo "⚠️  Go not found. Installing via Homebrew..."
    brew install go
else
    echo "✅ Go found ($(go version))."
fi

# 5. Install Project Dependencies
echo "📦 Installing root dependencies..."
pnpm install

echo "📦 Installing Editor dependencies (.juki/editor)..."
if [ -d ".juki/editor" ]; then
    cd .juki/editor
    pnpm install
    cd ../..
else
    echo "❌ .juki/editor directory not found!"
    exit 1
fi

echo "📦 Downloading Engine dependencies (.juki/engine)..."
if [ -d ".juki/engine" ]; then
    cd .juki/engine
    go mod download
    cd ../..
else
    echo "❌ .juki/engine directory not found!"
    exit 1
fi

echo "✅ Setup Complete!"

# 6. Ask to run the project
read -p "Do you want to run Juki now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/juki-run.sh
fi
