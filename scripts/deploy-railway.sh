#!/bin/bash
# Railway Backend Deploy Script - Run this locally before pushing to GitHub
# Railway will auto-deploy on push to main

echo "🚀 Preparing for Railway deployment..."

# 1. Verify no secrets in backend code
echo "1. Checking .env in backend/.gitignore..."
if grep -q "^\.env" backend/.gitignore; then
    echo "   ✅ .env in backend/.gitignore"
else
    echo "   ❌ .env NOT in backend/.gitignore - ABORT"
    exit 1
fi

# 2. Verify all env vars use process.env (no hardcoded secrets)
echo "2. Scanning for hardcoded secrets in backend/src..."
if grep -r "JWT_SECRET\s*=\s*['\"][^'\"]*['\"]\|DB_PASSWORD\s*=\s*['\"][^'\"]*['\"]\|DB_USER\s*=\s*['\"][^'\"]*['\"]" backend/src --include="*.js"; then
    echo "   ❌ Hardcoded secrets found - ABORT"
    exit 1
else
    echo "   ✅ No hardcoded secrets"
fi

# 3. Run gitleaks on backend
echo "3. Running gitleaks on backend..."
./gitleaks.exe detect --source backend --config .gitleaks.toml --redact || {
    echo "   ❌ Secrets found in backend - ABORT"
    exit 1
}
echo "   ✅ Backend clean"

# 4. Verify package.json has no git dependencies with auth
echo "4. Checking package.json for git+https:// with tokens..."
if grep -q "git+https://.*:.*@" backend/package.json; then
    echo "   ❌ Git dependencies with tokens found - ABORT"
    exit 1
else
    echo "   ✅ No token-bearing git deps"
fi

# 5. Check for helmet, cors, rate-limit middleware
echo "5. Checking security middleware..."
if grep -q "helmet" backend/src/index.js && grep -q "cors" backend/src/index.js && grep -q "rateLimit" backend/src/index.js; then
    echo "   ✅ helmet + cors + rate-limit present"
else
    echo "   ❌ Missing security middleware - ABORT"
    exit 1
fi

# 6. Verify JWT_SECRET is required (no fallback)
echo "6. Checking JWT_SECRET is required..."
if grep -q "JWT_SECRET.*||.*your-super-secret" backend/src/middleware/auth.js; then
    echo "   ❌ JWT_SECRET has fallback - ABORT"
    exit 1
elif grep -q "JWT_SECRET.*process.env.JWT_SECRET" backend/src/middleware/auth.js && grep -q "throw new Error.*JWT_SECRET" backend/src/middleware/auth.js; then
    echo "   ✅ JWT_SECRET required, no fallback"
else
    echo "   ❌ JWT_SECRET check failed - ABORT"
    exit 1
fi

# 7. Test install
echo "7. Testing npm install..."
cd backend && npm ci --production 2>&1 | tail -5
cd ..

echo ""
echo "✅ All Railway pre-deploy checks passed!"
echo "📤 Push to GitHub main branch to trigger Railway auto-deploy"
echo "   git add . && git commit -m 'deploy: backend production release' && git push origin main"