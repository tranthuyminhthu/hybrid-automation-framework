echo "🔍 Checking changed files to determine if Cypress tests need to run..."

CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

echo "📄 Changed files:"
echo "$CHANGED_FILES"

SHOULD_RUN=false

for file in $CHANGED_FILES; do
  if [[ "$file" == cypress/pages/* || "$file" == cypress/fixtures/* || "$file" == cypress/support/* || "$file" == cypress.config.* || "$file" == package.json ]]; then
    SHOULD_RUN=true
    break
  fi
done

if [ "$SHOULD_RUN" = true ]; then
  echo "✅ Changes related to tests detected - running Cypress tests..."
  npm run test-and-report
else
  echo "⏭️ No changes related to tests - skipping test step"
  exit 0 
fi