#!/bin/bash

# Test Update User Profile API with new dob and languagePreferences fields
# Make sure to replace USER_ID and TOKEN with actual values

BASE_URL="http://localhost:5000"
USER_ID="YOUR_USER_ID_HERE"
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "================================"
echo "Testing Update User Profile API"
echo "================================"
echo ""

# Test 1: Update with DOB and Language Preferences
echo "1. Updating user profile with DOB and language preferences..."
curl -X PUT "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dob": "1990-05-15",
    "languagePreferences": ["English", "Hindi", "Spanish"]
  }' | jq .

echo -e "\n"

# Test 2: Update only DOB
echo "2. Updating only DOB..."
curl -X PUT "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dob": "1995-12-20"
  }' | jq .

echo -e "\n"

# Test 3: Update only Language Preferences
echo "3. Updating only language preferences..."
curl -X PUT "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "languagePreferences": ["English", "French", "German"]
  }' | jq .

echo -e "\n"

# Test 4: Update full profile including existing fields
echo "4. Updating full profile..."
curl -X PUT "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "city": "New York",
    "state": "NY",
    "dob": "1992-08-10",
    "languagePreferences": ["English", "Spanish"]
  }' | jq .

echo -e "\n"

# Test 5: Invalid DOB format (should fail)
echo "5. Testing invalid DOB format (should fail)..."
curl -X PUT "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dob": "invalid-date"
  }' | jq .

echo -e "\n"

# Test 6: Invalid language preferences format (should fail)
echo "6. Testing invalid language preferences format (should fail)..."
curl -X PUT "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "languagePreferences": "English"
  }' | jq .

echo -e "\n"

# Test 7: Get user profile to verify updates
echo "7. Getting user profile to verify updates..."
curl -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n================================"
echo "Tests completed!"
echo "================================"
