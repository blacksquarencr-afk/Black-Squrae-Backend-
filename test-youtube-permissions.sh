#!/bin/bash

# YouTube Video API - Role Permission Test Script
# Tests admin and employee access with permissions

BASE_URL="https://nk5.yaatrabuddy.com"

echo "🎬 YouTube Video API - Permission Test"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Public Access - Get All Videos
echo "📋 Test 1: Public Access (No Auth)"
echo "-----------------------------------"
RESPONSE=$(curl -s "${BASE_URL}/api/youtube-videos")
echo "$RESPONSE" | jq '.'
echo ""

# Test 2: Add Video as Admin
echo "📋 Test 2: Admin Add Video"
echo "-----------------------------------"
read -p "Enter Admin Token: " ADMIN_TOKEN

ADMIN_ADD=$(curl -s --location "${BASE_URL}/api/youtube-videos/admin/add" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${ADMIN_TOKEN}" \
--data '{
  "title": "Admin Test Video",
  "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}')

echo "$ADMIN_ADD" | jq '.'
ADMIN_VIDEO_ID=$(echo "$ADMIN_ADD" | jq -r '.data._id // empty')
echo ""

# Test 3: Employee Login
echo "📋 Test 3: Employee Login"
echo "-----------------------------------"
read -p "Enter Employee Email: " EMP_EMAIL
read -sp "Enter Employee Password: " EMP_PASS
echo ""

EMP_LOGIN=$(curl -s --location "${BASE_URL}/api/employees/login" \
--header 'Content-Type: application/json' \
--data "{
  \"email\": \"${EMP_EMAIL}\",
  \"password\": \"${EMP_PASS}\"
}")

echo "$EMP_LOGIN" | jq '.'
EMP_TOKEN=$(echo "$EMP_LOGIN" | jq -r '.token // empty')
echo ""

if [ -z "$EMP_TOKEN" ]; then
    echo -e "${RED}❌ Employee login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Employee logged in successfully${NC}"
echo ""

# Test 4: Employee Add Video (With Permission Check)
echo "📋 Test 4: Employee Add Video (Permission Check)"
echo "-----------------------------------"
EMP_ADD=$(curl -s --location "${BASE_URL}/api/youtube-videos/add" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${EMP_TOKEN}" \
--data '{
  "title": "Employee Test Video",
  "videoLink": "https://www.youtube.com/watch?v=test123"
}')

echo "$EMP_ADD" | jq '.'
SUCCESS=$(echo "$EMP_ADD" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ Employee has CREATE permission${NC}"
    EMP_VIDEO_ID=$(echo "$EMP_ADD" | jq -r '.data._id')
else
    echo -e "${RED}❌ Employee lacks CREATE permission${NC}"
    echo "Message: $(echo "$EMP_ADD" | jq -r '.message')"
fi
echo ""

# Test 5: Employee Update Video (Permission Check)
if [ -n "$ADMIN_VIDEO_ID" ]; then
    echo "📋 Test 5: Employee Update Video (Permission Check)"
    echo "-----------------------------------"
    EMP_UPDATE=$(curl -s --location --request PUT "${BASE_URL}/api/youtube-videos/update/${ADMIN_VIDEO_ID}" \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer ${EMP_TOKEN}" \
    --data '{
      "title": "Updated by Employee"
    }')

    echo "$EMP_UPDATE" | jq '.'
    SUCCESS=$(echo "$EMP_UPDATE" | jq -r '.success')

    if [ "$SUCCESS" == "true" ]; then
        echo -e "${GREEN}✅ Employee has UPDATE permission${NC}"
    else
        echo -e "${RED}❌ Employee lacks UPDATE permission${NC}"
        echo "Message: $(echo "$EMP_UPDATE" | jq -r '.message')"
    fi
    echo ""
fi

# Test 6: Employee Delete Video (Permission Check)
if [ -n "$EMP_VIDEO_ID" ]; then
    echo "📋 Test 6: Employee Delete Video (Permission Check)"
    echo "-----------------------------------"
    EMP_DELETE=$(curl -s --location --request DELETE "${BASE_URL}/api/youtube-videos/delete/${EMP_VIDEO_ID}" \
    --header "Authorization: Bearer ${EMP_TOKEN}")

    echo "$EMP_DELETE" | jq '.'
    SUCCESS=$(echo "$EMP_DELETE" | jq -r '.success')

    if [ "$SUCCESS" == "true" ]; then
        echo -e "${GREEN}✅ Employee has DELETE permission${NC}"
    else
        echo -e "${RED}❌ Employee lacks DELETE permission${NC}"
        echo "Message: $(echo "$EMP_DELETE" | jq -r '.message')"
    fi
    echo ""
fi

# Test 7: Employee Toggle Status (Permission Check)
if [ -n "$ADMIN_VIDEO_ID" ]; then
    echo "📋 Test 7: Employee Toggle Status (Permission Check)"
    echo "-----------------------------------"
    EMP_TOGGLE=$(curl -s --location --request PATCH "${BASE_URL}/api/youtube-videos/toggle-status/${ADMIN_VIDEO_ID}" \
    --header "Authorization: Bearer ${EMP_TOKEN}")

    echo "$EMP_TOGGLE" | jq '.'
    SUCCESS=$(echo "$EMP_TOGGLE" | jq -r '.success')

    if [ "$SUCCESS" == "true" ]; then
        echo -e "${GREEN}✅ Employee has UPDATE permission (toggle)${NC}"
    else
        echo -e "${RED}❌ Employee lacks UPDATE permission${NC}"
        echo "Message: $(echo "$EMP_TOGGLE" | jq -r '.message')"
    fi
    echo ""
fi

# Summary
echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo ""
echo "Required Permissions for Full Access:"
echo "  Module: content-management"
echo "  Actions: create, read, update, delete"
echo ""
echo "To grant permissions, create/update role:"
echo "  POST ${BASE_URL}/admin/roles/create"
echo ""
echo "Example Role Permission:"
echo '{
  "module": "content-management",
  "actions": ["create", "read", "update", "delete"]
}'
echo ""

# Cleanup - Delete test videos created by admin
if [ -n "$ADMIN_VIDEO_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    read -p "Delete test videos? (y/n): " CLEANUP
    if [ "$CLEANUP" == "y" ]; then
        curl -s --location --request DELETE "${BASE_URL}/api/youtube-videos/admin/delete/${ADMIN_VIDEO_ID}" \
        --header "Authorization: Bearer ${ADMIN_TOKEN}" > /dev/null
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    fi
fi

echo ""
echo "✅ Test completed!"
