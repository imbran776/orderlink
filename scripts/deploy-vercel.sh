#!/bin/bash
# Vercel Deploy Script - Run this locally before pushing to GitHub
# Vercel will auto-deploy on push to main

echo "🚀 Preparing for Vercel deployment..."

# 1. Verify no secrets in frontend
echo "1. Checking .env files are in .gitignore..."
if grep -q "^\.env" .gitignore; then
    echo "   ✅ .env in .gitignore"
else
    echo "   ❌ .env NOT in .gitignore - ABORT"
    exit 1
fi

# 2. Verify VITE_ prefix for all frontend env vars
echo "2. Checking VITE_ prefix for frontend env..."
if [ -f .env ]; then
    grep -v "^#" .env | grep -v "^$" | while IFS= read -r line; do
        if [[ $line == VITE_* ]]; then
            echo "   ✅ $line"
        else
            echo "   ❌ Non-VITE_ var found: $line - Frontend env must use VITE_ prefix"
        fi
    done
fi

# 3. Run gitleaks scan
echo "3. Running gitleaks secret scan..."
./gitleaks.exe detect --source . --config .gitleaks.toml --redact || {
    echo "   ❌ Gitleaks found secrets - ABORT"
    exit 1
}
echo "   ✅ No secrets detected"

# 4. Build test
echo "4. Testing production build..."
npm run build || {
    echo "   ❌ Build failed - ABORT"
    exit 1
}
echo "   ✅ Build successful"

# 5. Verify dist/ in .gitignore
echo "5. Checking dist/ in .gitignore..."
if grep -q "^dist/" .gitignore; then
    echo "   ✅ dist/ in .gitignore"
else
    echo "   ❌ dist/ NOT in .gitignore - ABORT"
    exit 1
fi

echo ""
echo "✅ All Vercel pre-deploy checks passed!"
echo "📤 Push to GitHub main branch to trigger Vercel auto-deploy"
echo "   git add . && git commit -m 'deploy: production release' && git push origin main"