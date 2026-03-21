#!/bin/bash

# Add content-management permission to existing admin role
# Usage: ./add-content-permission.sh

BASE_URL="https://nk5.yaatrabuddy.com"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NThhZGE3MDFjZTYwZjgyMzg1ZjkxMiIsImVtYWlsIjoiYmxhY2tzcXVhcmVAZ21haWwuY29tIiwicm9sZSI6IjY5NThhZDQ3MDFjZTYwZjgyMzg1ZjhkOCIsInBlcm1pc3Npb25zIjpbeyJtb2R1bGUiOiJkYXNoYm9hcmQiLCJhY3Rpb25zIjpbInJlYWQiLCJkZWxldGUiXSwiX2lkIjoiNjk2ODgzNzNiNzRhZjhiOTVlMWQ2YmI1In0seyJtb2R1bGUiOiJwcm9wZXJ0aWVzIiwiYWN0aW9ucyI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sIl9pZCI6IjY5Njg4MzczYjc0YWY4Yjk1ZTFkNmJiNiJ9LHsibW9kdWxlIjoiY2F0ZWdvcmllcyIsImFjdGlvbnMiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJfaWQiOiI2OTY4ODM3M2I3NGFmOGI5NWUxZDZiYjcifSx7Im1vZHVsZSI6ImJvdWdodC1wcm9wZXJ0eSIsImFjdGlvbnMiOlsiY3JlYXRlIiwicmVhZCIsImRlbGV0ZSIsInVwZGF0ZSJdLCJfaWQiOiI2OTY4ODM3M2I3NGFmOGI5NWUxZDZiYjgifSx7Im1vZHVsZSI6InNldHRpbmdzIiwiYWN0aW9ucyI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sIl9pZCI6IjY5Njg4MzczYjc0YWY4Yjk1ZTFkNmJiOSJ9LHsibW9kdWxlIjoic2VjdXJpdHkiLCJhY3Rpb25zIjpbImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwiX2lkIjoiNjk2ODgzNzNiNzRhZjhiOTVlMWQ2YmJhIn0seyJtb2R1bGUiOiJibG9nX21hbmFnZW1lbnQiLCJhY3Rpb25zIjpbImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwiX2lkIjoiNjk2ODgzNzNiNzRhZjhiOTVlMWQ2YmJiIn0seyJtb2R1bGUiOiJibG9nIiwiYWN0aW9ucyI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sIl9pZCI6IjY5NjhkZTJmZjM2OGViY2Y2Mzg4YzNiYiJ9LHsiX2lkIjoiNjk2ZTE3ODgxNzZlNThlODBiMTNkNDM3IiwibW9kdWxlIjoiZGFzaGJvYXJkX2Jhbm5lciIsImFjdGlvbnMiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdfV0sImlhdCI6MTc2ODgyMjY2NCwiZXhwIjoxNzY4OTA5MDY0fQ.dCsgud3nIKTgT0KpuvFN3D-tXhR6fMVig7QCkDJYxzo"
ROLE_ID="6958ad47001ce60f82385f8d8"

echo "🔧 Adding content-management permission to admin role"
echo "===================================================="
echo ""

# Get current role details
echo "📋 Step 1: Fetching current role details..."
CURRENT_ROLE=$(curl -s --location "${BASE_URL}/admin/roles/${ROLE_ID}" \
--header "Authorization: Bearer ${ADMIN_TOKEN}")

echo "$CURRENT_ROLE" | jq '.'
echo ""

# Update role with new permission
echo "✏️ Step 2: Adding content-management permission..."
UPDATE_RESPONSE=$(curl -s --location --request PUT "${BASE_URL}/admin/roles/${ROLE_ID}" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${ADMIN_TOKEN}" \
--data '{
  "permissions": [
    {
      "module": "dashboard",
      "actions": ["read", "delete"]
    },
    {
      "module": "properties",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "categories",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "bought-property",
      "actions": ["create", "read", "delete", "update"]
    },
    {
      "module": "settings",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "security",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "blog_management",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "blog",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "dashboard_banner",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "content-management",
      "actions": ["create", "read", "update", "delete"]
    }
  ]
}')

echo "$UPDATE_RESPONSE" | jq '.'
echo ""

SUCCESS=$(echo "$UPDATE_RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
    echo "✅ Permission added successfully!"
    echo ""
    echo "⚠️  IMPORTANT: You need to login again to get a new token with updated permissions"
    echo ""
    echo "🔄 Step 3: Re-login to get new token..."
    
    LOGIN_RESPONSE=$(curl -s --location "${BASE_URL}/admin/login" \
    --header 'Content-Type: application/json' \
    --data '{
      "email": "blacksquare@gmail.com",
      "password": "blacksquare@gmail.com"
    }')
    
    NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    
    if [ "$NEW_TOKEN" != "null" ] && [ -n "$NEW_TOKEN" ]; then
        echo "✅ New token generated!"
        echo ""
        echo "📋 New Token:"
        echo "$NEW_TOKEN"
        echo ""
        
        # Test YouTube API with new token
        echo "🧪 Step 4: Testing YouTube API with new token..."
        TEST_RESPONSE=$(curl -s --location "${BASE_URL}/api/youtube-videos/add" \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer ${NEW_TOKEN}" \
        --data '{
          "title": "Luxury Living Rooms",
          "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }')
        
        echo "$TEST_RESPONSE" | jq '.'
        
        TEST_SUCCESS=$(echo "$TEST_RESPONSE" | jq -r '.success')
        if [ "$TEST_SUCCESS" == "true" ]; then
            echo ""
            echo "✅ YouTube API working perfectly!"
        else
            echo ""
            echo "❌ YouTube API test failed. Check response above."
        fi
    else
        echo "❌ Failed to get new token"
    fi
else
    echo "❌ Failed to add permission"
fi

echo ""
echo "✅ Script completed!"
