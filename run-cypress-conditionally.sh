#!/bin/bash

echo "🔍 Kiểm tra file thay đổi để xác định có cần chạy Cypress test không..."

# Lấy danh sách file thay đổi so với commit trước
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

# In ra danh sách file thay đổi
echo "📄 Các file đã thay đổi:"
echo "$CHANGED_FILES"

# Kiểm tra xem có file nào nằm trong thư mục liên quan đến test
SHOULD_RUN=false

for file in $CHANGED_FILES; do
  if [[ "$file" == cypress/pages/* || "$file" == cypress/fixtures/* || "$file" == cypress/support/* || "$file" == cypress.config.* || "$file" == package.json ]]; then
    SHOULD_RUN=true
    break
  fi
done

if [ "$SHOULD_RUN" = true ]; then
  echo "✅ Có thay đổi liên quan đến test - đang chạy test Cypress..."
  npm run test-and-report
else
  echo "⏭️ Không có thay đổi liên quan đến test - bỏ qua bước test."
  exit 0  # Thoát với mã 0 để không làm thất bại workflow
fi