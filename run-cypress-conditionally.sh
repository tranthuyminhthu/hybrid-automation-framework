#!/bin/bash

echo "🔍 Kiểm tra file thay đổi để xác định có cần chạy Cypress test không..."

# Lấy danh sách file thay đổi so với commit trước
CHANGED_FILES=$(git diff --name-only HEAD~1)

# In ra danh sách file thay đổi
echo "📄 Các file đã thay đổi:"
echo "$CHANGED_FILES"

# Kiểm tra xem có file nào nằm trong thư mục liên quan đến test
SHOULD_RUN=false

for file in $CHANGED_FILES; do
  if [[ "$file" == cypress/e2e/* || "$file" == cypress/support/* || "$file" == cypress.config.* || "$file" == package.json || "$file" == *.ts || "$file" == *.js ]]; then
    SHOULD_RUN=true
    break
  fi
done

if [ "$SHOULD_RUN" = true ]; then
  echo "✅ Có thay đổi liên quan đến test - đang chạy test Cypress..."
  npm run test-and-report
else
  echo "⏭️ Không có thay đổi liên quan đến test - bỏ qua bước test."
fi
