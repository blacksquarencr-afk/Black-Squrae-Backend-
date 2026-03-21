#!/bin/bash

# Test Property Requirement API
# Make sure to replace TOKEN with actual JWT token

BASE_URL="http://localhost:5000"
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "========================================"
echo "Testing Property Requirement API"
echo "========================================"
echo ""

# Test 1: Update all property requirement fields
echo "1. Updating all property requirement fields..."
curl -X PUT "$BASE_URL/api/users/property-requirement/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "purchasingFor": "Investment",
    "investmentAmount": "₹50 Lakhs - ₹1 Crore"
  }' | jq .

echo -e "\n"

# Test 2: Update only purchasing for
echo "2. Updating only purchasing for..."
curl -X PUT "$BASE_URL/api/users/property-requirement/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "purchasingFor": "Self Use"
  }' | jq .

echo -e "\n"

# Test 3: Update only investment amount
echo "3. Updating only investment amount..."
curl -X PUT "$BASE_URL/api/users/property-requirement/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "investmentAmount": "₹1 Crore+"
  }' | jq .

echo -e "\n"

# Test 4: Update with different values
echo "4. Updating with rental purpose..."
curl -X PUT "$BASE_URL/api/users/property-requirement/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "purchasingFor": "Rental Income",
    "investmentAmount": "₹75 Lakhs"
  }' | jq .

echo -e "\n"

# Test 5: Clear values by sending empty strings
echo "5. Clearing values..."
curl -X PUT "$BASE_URL/api/users/property-requirement/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "purchasingFor": "",
    "investmentAmount": ""
  }' | jq .

echo -e "\n"

# Test 6: Get profile to verify property requirement
echo "6. Getting profile to verify property requirement..."
curl -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .propertyRequirement

echo -e "\n========================================"
echo "Tests completed!"
echo "========================================"
