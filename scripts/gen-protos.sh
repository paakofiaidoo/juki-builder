#!/bin/bash

# Ensure we can find the go binaries
GOBIN=$(go env GOPATH)/bin
export PATH=$(pwd)/.juki/editor/node_modules/.bin:$GOBIN:$PATH

echo "🚀 Generating Protos..."
echo "Using protoc-gen-es from: $(which protoc-gen-es)"
protoc-gen-es --version
echo "Running buf generate in .juki/protos..."

cd .juki/protos && buf generate

if [ $? -eq 0 ]; then
    echo "✅ Proto generation successful!"
else
    echo "❌ Proto generation failed."
    exit 1
fi