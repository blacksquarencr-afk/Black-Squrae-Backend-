#!/bin/bash

# Property Management Enquiry API Test Script
# This script tests the property management enquiry creation endpoint

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
BASE_URL="https://backend.blacksquare.estate"
# For local testing, use:
# BASE_URL="http://localhost:4000"

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}Property Management Enquiry API Test${NC}"
echo -e "${YELLOW}======================================${NC}\n"

# Test 1: Create property management enquiry (with email)
echo -e "${YELLOW}Test 1: Creating property management enquiry with email...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobileNumber": "9876543210",
    "email": "testuser@example.com",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }')

echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✓ Test 1 Passed${NC}\n"
else
  echo -e "${RED}✗ Test 1 Failed${NC}\n"
fi

# Test 2: Create property management enquiry (without email)
echo -e "${YELLOW}Test 2: Creating property management enquiry without email...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Another User",
    "mobileNumber": "8765432109",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }')

echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✓ Test 2 Passed${NC}\n"
else
  echo -e "${RED}✗ Test 2 Failed${NC}\n"
fi

# Test 3: Test validation - Missing fullName
echo -e "${YELLOW}Test 3: Testing validation (missing fullName)...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }')

echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.message | contains("required")' > /dev/null; then
  echo -e "${GREEN}✓ Test 3 Passed (Validation working)${NC}\n"
else
  echo -e "${RED}✗ Test 3 Failed${NC}\n"
fi

# Test 4: Test validation - Missing mobileNumber
echo -e "${YELLOW}Test 4: Testing validation (missing mobileNumber)...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1"
  }')

echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.message | contains("required")' > /dev/null; then
  echo -e "${GREEN}✓ Test 4 Passed (Validation working)${NC}\n"
else
  echo -e "${RED}✗ Test 4 Failed${NC}\n"
fi

# Test 5: Test validation - Missing propertyId
echo -e "${YELLOW}Test 5: Testing validation (missing propertyId)...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/enquiries/property-management" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobileNumber": "9876543210"
  }')

echo "$RESPONSE" | jq '.'
if echo "$RESPONSE" | jq -e '.message | contains("required")' > /dev/null; then
  echo -e "${GREEN}✓ Test 5 Passed (Validation working)${NC}\n"
else
  echo -e "${RED}✗ Test 5 Failed${NC}\n"
fi

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}All tests completed${NC}"
echo -e "${YELLOW}======================================${NC}"
