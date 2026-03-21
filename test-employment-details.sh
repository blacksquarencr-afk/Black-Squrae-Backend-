#!/bin/bash

# Test Employment Details API
# Make sure to replace TOKEN with actual JWT token

BASE_URL="http://localhost:5000"
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "========================================"
echo "Testing Employment Details API"
echo "========================================"
echo ""

# Test 1: Update all employment details
echo "1. Updating all employment details..."
curl -X PUT "$BASE_URL/api/users/employment/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employmentType": "Full-time",
    "designation": "Software Engineer",
    "companyName": "Tech Corp",
    "income": 1200000
  }' | jq .

echo -e "\n"

# Test 2: Update only employment type
echo "2. Updating only employment type..."
curl -X PUT "$BASE_URL/api/users/employment/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employmentType": "Self-employed"
  }' | jq .

echo -e "\n"

# Test 3: Update designation and company
echo "3. Updating designation and company..."
curl -X PUT "$BASE_URL/api/users/employment/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "designation": "Senior Developer",
    "companyName": "Google"
  }' | jq .

echo -e "\n"

# Test 4: Update only income
echo "4. Updating only income..."
curl -X PUT "$BASE_URL/api/users/employment/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "income": 1500000
  }' | jq .

echo -e "\n"

# Test 5: Invalid income (should fail)
echo "5. Testing invalid income (should fail)..."
curl -X PUT "$BASE_URL/api/users/employment/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "income": "not-a-number"
  }' | jq .

echo -e "\n"

# Test 6: Negative income (should fail)
echo "6. Testing negative income (should fail)..."
curl -X PUT "$BASE_URL/api/users/employment/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "income": -50000
  }' | jq .

echo -e "\n"

# Test 7: Get profile to verify employment details
echo "7. Getting profile to verify employment details..."
curl -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .employmentDetails

echo -e "\n========================================"
echo "Tests completed!"
echo "========================================"
