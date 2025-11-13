#!/bin/bash

# Script kiểm tra trước khi deploy
# Chạy: bash scripts/pre-deploy-check.sh

set -e

echo "🔍 PRE-DEPLOYMENT CHECK"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "📦 Checking Frontend..."
echo "------------------------"

# Check if frontend directory exists
if [ -d "frontend" ]; then
    success "Frontend directory exists"

    cd frontend

    # Check if package.json exists
    if [ -f "package.json" ]; then
        success "package.json found"
    else
        error "package.json not found"
    fi

    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        success "node_modules installed"
    else
        warning "node_modules not found, running npm install..."
        npm install
    fi

    # TypeScript check
    echo ""
    echo "🔍 Running TypeScript check..."
    if npx tsc --noEmit; then
        success "TypeScript check passed"
    else
        error "TypeScript errors found"
    fi

    # Build check
    echo ""
    echo "🏗️  Running build..."
    if npm run build; then
        success "Frontend build successful"
    else
        error "Frontend build failed"
    fi

    cd ..
else
    error "Frontend directory not found"
fi

echo ""
echo "🔧 Checking Backend..."
echo "------------------------"

# Check if backend directory exists
if [ -d "backend" ]; then
    success "Backend directory exists"

    cd backend

    # Check if package.json exists
    if [ -f "package.json" ]; then
        success "package.json found"
    else
        error "package.json not found"
    fi

    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        success "node_modules installed"
    else
        warning "node_modules not found, running npm install..."
        npm install
    fi

    # Check Prisma schema
    if [ -f "prisma/schema.prisma" ]; then
        success "Prisma schema found"

        # Generate Prisma client
        echo ""
        echo "🔨 Generating Prisma client..."
        if npx prisma generate; then
            success "Prisma client generated"
        else
            error "Prisma generate failed"
        fi
    else
        warning "Prisma schema not found"
    fi

    # TypeScript check
    echo ""
    echo "🔍 Running TypeScript check..."
    if npx tsc --noEmit; then
        success "TypeScript check passed"
    else
        error "TypeScript errors found"
    fi

    cd ..
else
    error "Backend directory not found"
fi

echo ""
echo "📄 Checking Configuration Files..."
echo "-----------------------------------"

# Check .env files
if [ -f "backend/.env" ]; then
    success "Backend .env exists"

    # Check required env vars
    if grep -q "DATABASE_URL" backend/.env; then
        success "DATABASE_URL configured"
    else
        error "DATABASE_URL not found in .env"
    fi

    if grep -q "JWT_SECRET" backend/.env; then
        success "JWT_SECRET configured"
    else
        error "JWT_SECRET not found in .env"
    fi
else
    warning "Backend .env not found"
fi

if [ -f "frontend/.env" ]; then
    success "Frontend .env exists"

    if grep -q "VITE_API_URL" frontend/.env; then
        success "VITE_API_URL configured"
    else
        warning "VITE_API_URL not found in .env"
    fi
else
    warning "Frontend .env not found"
fi

# Check vercel.json
if [ -f "backend/vercel.json" ]; then
    success "Backend vercel.json exists"
else
    warning "Backend vercel.json not found"
fi

if [ -f "frontend/vercel.json" ]; then
    success "Frontend vercel.json exists"
else
    warning "Frontend vercel.json not found (optional)"
fi

echo ""
echo "🌳 Checking Git Status..."
echo "--------------------------"

# Check git status
if git diff-index --quiet HEAD --; then
    success "No uncommitted changes"
else
    warning "You have uncommitted changes"
    git status --short
fi

# Check current branch
BRANCH=$(git branch --show-current)
success "Current branch: $BRANCH"

echo ""
echo "📊 SUMMARY"
echo "=========="
echo -e "${GREEN}Passed:${NC} $PASSED"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed:${NC} $FAILED"
else
    echo -e "${GREEN}Failed:${NC} 0"
fi

echo ""
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Pre-deployment check FAILED${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
else
    echo -e "${GREEN}✅ Pre-deployment check PASSED${NC}"
    echo "You can safely deploy now!"
    exit 0
fi
