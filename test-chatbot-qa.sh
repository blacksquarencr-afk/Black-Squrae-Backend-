#!/bin/bash

# Test Chatbot Q&A API

BASE_URL="http://localhost:4000"

echo "==================================="
echo "Testing Chatbot Q&A API"
echo "==================================="

# Test 1: Ask greeting
echo -e "\n1. Testing greeting (hi):"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "hi"}' \
  | jq '.'

# Test 2: Ask about buying
echo -e "\n2. Testing buying inquiry:"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "I want to buy a property"}' \
  | jq '.'

# Test 3: Ask about rent
echo -e "\n3. Testing rental inquiry:"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "Do you have properties for rent?"}' \
  | jq '.'

# Test 4: Ask about price
echo -e "\n4. Testing price inquiry:"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the cost?"}' \
  | jq '.'

# Test 5: Ask about location
echo -e "\n5. Testing location inquiry:"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "Do you have properties in Noida?"}' \
  | jq '.'

# Test 6: Ask about site visit
echo -e "\n6. Testing site visit inquiry:"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "Can I visit the property?"}' \
  | jq '.'

# Test 7: Ask about agent
echo -e "\n7. Testing agent contact:"
curl -X POST "$BASE_URL/api/chatbot/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "I want to talk to an agent"}' \
  | jq '.'

# Test 8: Get all Q&A (no auth needed for testing)
echo -e "\n8. Get all Q&A entries:"
curl -X GET "$BASE_URL/api/chatbot/qa?limit=5" \
  | jq '.'

echo -e "\n==================================="
echo "Testing Complete!"
echo "==================================="
