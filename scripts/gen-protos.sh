#!/bin/bash

# Ensure we can find the go binaries
GOBIN=$(go env GOPATH)/bin
export PATH=$PATH:$GOBIN:$(pwd)/.juki/editor/node_modules/.bin

echo "🚀 Generating Protos..."
echo "Running buf generate in .juki/protos..."

cd .juki/protos && buf generate

if [ $? -eq 0 ]; then
    echo "✅ Proto generation successful!"
else
    echo "❌ Proto generation failed."
    exit 1
fi
