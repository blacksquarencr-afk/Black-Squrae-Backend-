#!/bin/bash

# Test Employee Enquiries Endpoint
# This script tests the new /api/inquiry/employee/assigned-enquiries endpoint

BASE_URL="https://backend.blacksquare.estate/api"

echo "========================================="
echo "Testing Employee Enquiries Endpoint"
echo "========================================="
echo ""

# Step 1: Employee Login
echo "Step 1: Employee Login..."
echo "Email: bhaveshkumar0503@gmail.com"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/employees/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bhaveshkumar0503@gmail.com",
    "password": "12345678"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .data.token // empty')
EMPLOYEE_ID=$(echo "$LOGIN_RESPONSE" | jq -r '._id // .data._id // .employee._id // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ ERROR: Failed to get token from login response"
  exit 1
fi

echo "✅ Login successful!"
echo "Employee ID: $EMPLOYEE_ID"
echo "Token: ${TOKEN:0:50}..."
echo ""
echo "========================================="
echo ""

# Step 2: Get Assigned Enquiries
echo "Step 2: Fetching assigned enquiries..."
echo "GET ${BASE_URL}/inquiry/employee/assigned-enquiries?page=1&limit=10"
echo ""

ENQUIRIES_RESPONSE=$(curl -s -X GET "${BASE_URL}/inquiry/employee/assigned-enquiries?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Enquiries Response:"
echo "$ENQUIRIES_RESPONSE" | jq '.'
echo ""

# Check if successful
SUCCESS=$(echo "$ENQUIRIES_RESPONSE" | jq -r '.success // false')
ENQUIRY_COUNT=$(echo "$ENQUIRIES_RESPONSE" | jq -r '.data | length')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Successfully fetched assigned enquiries!"
  echo "Number of enquiries: $ENQUIRY_COUNT"
  echo ""
  
  if [ "$ENQUIRY_COUNT" -gt 0 ]; then
    echo "First enquiry details:"
    echo "$ENQUIRIES_RESPONSE" | jq '.data[0]'
  else
    echo "⚠️  No enquiries assigned to this employee yet."
  fi
else
  echo "❌ Failed to fetch enquiries"
  echo "Error: $(echo "$ENQUIRIES_RESPONSE" | jq -r '.message // "Unknown error"')"
fi

echo ""
echo "========================================="
echo "Testing with different query parameters"
echo "========================================="
echo ""

# Test with status filter
echo "Test 3: Filtering by status=active..."
curl -s -X GET "${BASE_URL}/inquiry/employee/assigned-enquiries?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test with priority filter
echo "Test 4: Filtering by priority=high..."
curl -s -X GET "${BASE_URL}/inquiry/employee/assigned-enquiries?page=1&limit=10&priority=high" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test with assignment status
echo "Test 5: Filtering by assignmentStatus=active..."
curl -s -X GET "${BASE_URL}/inquiry/employee/assigned-enquiries?page=1&limit=10&assignmentStatus=active" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "========================================="
echo "Test Complete!"
echo "========================================="
