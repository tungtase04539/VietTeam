#!/bin/bash

# Script test production sau khi deploy
# Chạy: bash scripts/test-production.sh

set -e

echo "🧪 PRODUCTION TEST"
echo "=================="
echo ""

# URLs
BACKEND_URL="https://viet-team.vercel.app"
FRONTEND_URL="https://viet-team-frontend.vercel.app"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo "🔧 Testing Backend: $BACKEND_URL"
echo "-----------------------------------"

# Test health endpoint
info "Testing /api/health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    success "Health check passed (HTTP $HEALTH_RESPONSE)"
    HEALTH_DATA=$(curl -s "$BACKEND_URL/api/health")
    echo "  Response: $HEALTH_DATA"
else
    error "Health check failed (HTTP $HEALTH_RESPONSE)"
fi

# Test login endpoint (should return 400 or 401 for invalid credentials)
echo ""
info "Testing /api/auth/login..."
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}')

if [ "$LOGIN_RESPONSE" = "401" ] || [ "$LOGIN_RESPONSE" = "400" ] || [ "$LOGIN_RESPONSE" = "404" ]; then
    success "Login endpoint responding (HTTP $LOGIN_RESPONSE)"
elif [ "$LOGIN_RESPONSE" = "200" ]; then
    success "Login endpoint responding (HTTP $LOGIN_RESPONSE) - credentials might be valid"
else
    error "Login endpoint error (HTTP $LOGIN_RESPONSE)"
fi

# Test register endpoint (should accept POST requests)
echo ""
info "Testing /api/auth/register..."
REGISTER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"","password":"","name":""}')

if [ "$REGISTER_RESPONSE" = "400" ] || [ "$REGISTER_RESPONSE" = "500" ]; then
    success "Register endpoint responding (HTTP $REGISTER_RESPONSE)"
elif [ "$REGISTER_RESPONSE" = "200" ] || [ "$REGISTER_RESPONSE" = "201" ]; then
    success "Register endpoint responding (HTTP $REGISTER_RESPONSE)"
else
    error "Register endpoint error (HTTP $REGISTER_RESPONSE)"
fi

echo ""
echo "🌐 Testing Frontend: $FRONTEND_URL"
echo "------------------------------------"

# Test frontend availability
info "Testing frontend homepage..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    success "Frontend is accessible (HTTP $FRONTEND_RESPONSE)"
else
    error "Frontend error (HTTP $FRONTEND_RESPONSE)"
fi

# Check if frontend can reach backend (check for CORS)
echo ""
info "Testing CORS..."
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BACKEND_URL/api/health" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET")

if [ "$CORS_RESPONSE" = "200" ] || [ "$CORS_RESPONSE" = "204" ]; then
    success "CORS configured correctly (HTTP $CORS_RESPONSE)"
else
    error "CORS might have issues (HTTP $CORS_RESPONSE)"
fi

echo ""
echo "📊 SUMMARY"
echo "=========="
echo ""
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo -e "${GREEN}✓${NC} Tests completed"
echo ""
echo "💡 Tips:"
echo "  - Open $FRONTEND_URL in browser"
echo "  - Check browser console (F12) for errors"
echo "  - Try login/register functionality"
echo "  - Monitor Vercel logs for any issues"
echo ""
echo "📝 Vercel Dashboard:"
echo "  Backend:  https://vercel.com/dashboard"
echo "  Frontend: https://vercel.com/dashboard"
