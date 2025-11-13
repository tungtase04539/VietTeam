#!/bin/bash

echo "🔍 Testing Frontend Build Locally..."
echo ""

# Check formatDate removed
echo "1. Checking formatDate removed..."
if grep -q "formatDate" src/pages/AdminDashboard.tsx; then
  echo "   ❌ FAIL: formatDate still exists!"
  exit 1
else
  echo "   ✅ PASS: formatDate removed"
fi

# Check vite-env.d.ts exists
echo "2. Checking vite-env.d.ts exists..."
if [ -f "src/vite-env.d.ts" ]; then
  echo "   ✅ PASS: vite-env.d.ts exists"
else
  echo "   ❌ FAIL: vite-env.d.ts missing!"
  exit 1
fi

# Check tsconfig has vite/client
echo "3. Checking tsconfig.json has vite/client..."
if grep -q "vite/client" tsconfig.json; then
  echo "   ✅ PASS: tsconfig has vite/client types"
else
  echo "   ❌ FAIL: tsconfig missing vite/client!"
  exit 1
fi

echo ""
echo "✅ All checks passed! Code is ready."
echo ""
echo "Now testing actual build..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try to build
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 BUILD SUCCESS!"
  echo ""
  echo "Frontend build thành công!"
  echo "Code đã sẵn sàng để deploy lên Vercel."
  echo ""
  echo "Next steps:"
  echo "1. Push code: git push"
  echo "2. Redeploy trong Vercel (xem VERCEL_FORCE_REDEPLOY.md)"
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ BUILD FAILED!"
  echo ""
  echo "Có lỗi khi build. Xem error ở trên."
fi
