#!/bin/bash

# Configuration
BRANCH_NAME="${1:-development}"
COMMIT_MSG="${2:-chore: sync development update}"
REPOS=("." ".juki/editor" ".juki/engine" ".juki/protos")

echo "🚀 Starting Git Sync for branch: $BRANCH_NAME"
echo "📝 Commit Message: $COMMIT_MSG"
echo "----------------------------------------"

for repo in "${REPOS[@]}"; do
    if [ -d "$repo/.git" ] || [ -f "$repo/.git" ]; then
        echo "📂 Processing: $repo"
        cd "$repo" || exit

        # Check for changes
        if [[ -n $(git status -s) ]]; then
            echo "   - Changes detected. Staging..."
            git add .

            echo "   - Committing..."
            git commit -m "$COMMIT_MSG"

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

echo "🎉 All repositories processed!"
