#!/bin/bash

# Configuration
# Default Repositories
ALL_REPOS=("." ".juki/editor" ".juki/engine" ".juki/protos")

# --- Interactive Prompts ---

echo "🚀 Starting Juki Git Sync"
echo "----------------------------------------"

# 1. Branch Name
read -p "🌿 Branch Name (default: development): " INPUT_BRANCH
BRANCH_NAME="${INPUT_BRANCH:-development}"

# 2. Commit Message (Title)
read -p "📝 Commit Message (Title): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    echo "❌ Commit message is required."
    exit 1
fi

# 3. Commit Description (Optional)
read -p "📄 Commit Description (Optional): " COMMIT_DESC

# 4. Scope (Repos)
echo "----------------------------------------"
echo "📦 Available Repositories:"
for i in "${!ALL_REPOS[@]}"; do
    echo "   [$i] ${ALL_REPOS[$i]}"
done
echo "   [all] All Repositories (default)"
read -p "👉 Select Scope (comma-separated indices, or 'all'): " INPUT_SCOPE

# Determine Target Repos
TARGET_REPOS=()

if [ -z "$INPUT_SCOPE" ] || [ "$INPUT_SCOPE" == "all" ]; then
    TARGET_REPOS=("${ALL_REPOS[@]}")
else
    # Split by comma
    IFS=',' read -ra ADDR <<< "$INPUT_SCOPE"
    for i in "${ADDR[@]}"; do
        # Trim whitespace
        index=$(echo "$i" | xargs)
        if [[ "$index" =~ ^[0-9]+$ ]] && [ "$index" -ge 0 ] && [ "$index" -lt ${#ALL_REPOS[@]} ]; then
            TARGET_REPOS+=("${ALL_REPOS[$index]}")
        else
            echo "⚠️ Invalid index '$index', skipping."
        fi
    done
fi

if [ ${#TARGET_REPOS[@]} -eq 0 ]; then
    echo "❌ No valid repositories selected."
    exit 1
fi

echo "----------------------------------------"
echo "📋 Summary:"
echo "   - Branch: $BRANCH_NAME"
echo "   - Message: $COMMIT_MSG"
if [ -n "$COMMIT_DESC" ]; then
    echo "   - Description: $COMMIT_DESC"
fi
echo "   - Repos: ${TARGET_REPOS[*]}"
echo "----------------------------------------"
read -p "Press [Enter] to continue or [Ctrl+C] to cancel..."

# --- Sync Logic ---

for repo in "${TARGET_REPOS[@]}"; do
    if [ -d "$repo/.git" ] || [ -f "$repo/.git" ]; then
        echo "📂 Processing: $repo"
        cd "$repo" || exit

        # Check for changes
        if [[ -n $(git status -s) ]]; then
            echo "   - Changes detected. Staging..."
            git add .

            echo "   - Committing..."
            if [ -n "$COMMIT_DESC" ]; then
                git commit -m "$COMMIT_MSG" -m "$COMMIT_DESC"
            else
                git commit -m "$COMMIT_MSG"
            fi

            echo "   - Pushing to origin/$BRANCH_NAME..."
            # Create branch if it doesn't exist locally
            if ! git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
                 git checkout -b $BRANCH_NAME
            else
                 git checkout $BRANCH_NAME
            fi

            # Helper: If origin doesn't exist, we skip push but warn
            if git remote | grep -q "origin"; then
                git push -u origin $BRANCH_NAME
            else
                echo "   ⚠️ No remote 'origin' found. Skipping push."
            fi
        else
            echo "   - No changes to commit."
        fi

        # Return to root
        cd - > /dev/null
        echo "✅ Done with $repo"
        echo "----------------------------------------"
    else
        echo "⚠️ Skipping $repo (Not a git repository)"
        echo "----------------------------------------"
    fi
done

echo "🎉 All selected repositories processed!"
