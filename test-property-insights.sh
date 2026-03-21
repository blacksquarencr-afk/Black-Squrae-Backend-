#!/bin/bash

# Property Insights API Test Script
# This script tests all property insights endpoints

BASE_URL="http://localhost:4000/api/property-insights"
LOCATION="Faridabad"

echo "======================================"
echo "Property Insights API Tests"
echo "======================================"
echo ""

# Test 1: Price Insights
echo "1. Testing Price Insights..."
curl -X GET "$BASE_URL/price-insights?location=$LOCATION" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 2: Micromarket Comparison
echo "2. Testing Micromarket Comparison..."
curl -X GET "$BASE_URL/micromarket-comparison?location=$LOCATION" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 3: Rental Supply
echo "3. Testing Rental Supply..."
curl -X GET "$BASE_URL/rental-supply?location=$LOCATION" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 4: Heatmap Data
echo "4. Testing Heatmap Data..."
curl -X GET "$BASE_URL/heatmap?location=$LOCATION" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 5: Statistics (with location)
echo "5. Testing Statistics (with location)..."
curl -X GET "$BASE_URL/statistics?location=$LOCATION" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 6: Statistics (all locations)
echo "6. Testing Statistics (all locations)..."
curl -X GET "$BASE_URL/statistics" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 7: Trending Properties
echo "7. Testing Trending Properties..."
curl -X GET "$BASE_URL/trending?location=$LOCATION&limit=5" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 8: Price Trends
echo "8. Testing Price Trends..."
curl -X GET "$BASE_URL/price-trends?location=$LOCATION&months=6" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Test 9: Amenities Popularity
echo "9. Testing Amenities Popularity..."
curl -X GET "$BASE_URL/amenities-popularity?location=$LOCATION" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "======================================"
echo "All tests completed!"
echo "======================================"
