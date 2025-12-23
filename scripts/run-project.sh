#!/bin/bash

PROJECT_PATH="$1"
PORT="$2"

if [ -z "$PROJECT_PATH" ] || [ -z "$PORT" ]; then
    echo "Usage: $0 <project_path> <port>"
    exit 1
fi

echo "🚀 Attempting to run project at $PROJECT_PATH on port $PORT"

# Check if port is in use
if lsof -i :$PORT > /dev/null; then
    echo "⚠️  Port $PORT is already in use. Assuming project is running."
    exit 0
fi

# Navigate to project
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Project directory not found: $PROJECT_PATH"
    exit 1
fi

cd "$PROJECT_PATH" || exit

# Run dev server in background
# We rely on nohup/disown to keep it alive if the parent (Engine) restarts?
# Actually, if Engine spawns it, we might want it to persist.
# For now, standard backgrounding.
LOG_FILE="$PROJECT_PATH/.juki-dev.log"
echo "🟢 Starting dev server... Logs: $LOG_FILE"
nohup npm run dev -- -p $PORT > "$LOG_FILE" 2>&1 &

PID=$!
echo "✅ Started with PID $PID. Logs at $LOG_FILE"
exit 0
