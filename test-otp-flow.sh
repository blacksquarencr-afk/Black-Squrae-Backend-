#!/bin/bash

# Test OTP Authentication Flow
# Usage: ./test-otp-flow.sh <phone_number>

BASE_URL="https://nk5.yaatrabuddy.com"
PHONE="${1:-7737470723}"

echo "🧪 Testing OTP Authentication Flow"
echo "===================================="
echo "Phone: $PHONE"
echo ""

# Step 1: Send OTP
echo "📤 Step 1: Sending OTP..."
SEND_RESPONSE=$(curl -s --location "${BASE_URL}/auth/send-phone-otp" \
--header 'Content-Type: application/json' \
--data "{
  \"phone\": \"${PHONE}\"
}")

echo "$SEND_RESPONSE" | jq '.'
echo ""

SMS_SUCCESS=$(echo "$SEND_RESPONSE" | jq -r '.smsSuccess')
IS_REGISTERED=$(echo "$SEND_RESPONSE" | jq -r '.isRegistered')

if [ "$SMS_SUCCESS" != "true" ]; then
    echo "❌ SMS failed to send. Check the response above."
    # Extract OTP from response for testing
    OTP=$(echo "$SEND_RESPONSE" | jq -r '.otp // empty')
    if [ -n "$OTP" ]; then
        echo "⚠️  Development OTP found in response: $OTP"
    else
        exit 1
    fi
else
    echo "✅ OTP sent successfully!"
    echo ""
    read -p "📱 Enter the OTP received: " OTP
fi

echo ""

# Step 2: Verify OTP
echo "🔐 Step 2: Verifying OTP..."
VERIFY_RESPONSE=$(curl -s --location "${BASE_URL}/auth/verify-phone-otp" \
--header 'Content-Type: application/json' \
--data "{
  \"phone\": \"${PHONE}\",
  \"otp\": \"${OTP}\"
}")

echo "$VERIFY_RESPONSE" | jq '.'
echo ""

SUCCESS=$(echo "$VERIFY_RESPONSE" | jq -r '.success')
TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.token')
NEEDS_REG=$(echo "$VERIFY_RESPONSE" | jq -r '.user.needsRegistration')

if [ "$SUCCESS" != "true" ]; then
    echo "❌ OTP verification failed"
    exit 1
fi

echo "✅ OTP verified successfully!"
echo "Token: ${TOKEN:0:20}..."
echo "Needs Registration: $NEEDS_REG"
echo ""

# Step 3: Test property upload (should fail if registration incomplete)
echo "📋 Step 3: Testing property upload..."
UPLOAD_RESPONSE=$(curl -s --location "${BASE_URL}/add/add" \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
  "title": "Test Property",
  "price": 5000000
}')

echo "$UPLOAD_RESPONSE" | jq '.'
echo ""

NEEDS_REGISTRATION=$(echo "$UPLOAD_RESPONSE" | jq -r '.needsRegistration // false')

if [ "$NEEDS_REGISTRATION" == "true" ]; then
    echo "✅ Property upload correctly blocked - registration required"
    echo ""
    
    # Step 4: Complete registration
    echo "📝 Step 4: Completing registration..."
    echo "Enter user details:"
    read -p "Full Name: " FULLNAME
    read -p "Email: " EMAIL
    read -p "Password: " PASSWORD
    
    COMPLETE_RESPONSE=$(curl -s --location "${BASE_URL}/auth/complete-registration" \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer ${TOKEN}" \
    --data "{
      \"fullName\": \"${FULLNAME}\",
      \"email\": \"${EMAIL}\",
      \"password\": \"${PASSWORD}\",
      \"state\": \"Test State\",
      \"city\": \"Test City\"
    }")
    
    echo "$COMPLETE_RESPONSE" | jq '.'
    echo ""
    
    REG_SUCCESS=$(echo "$COMPLETE_RESPONSE" | jq -r '.success')
    if [ "$REG_SUCCESS" == "true" ]; then
        echo "✅ Registration completed successfully!"
        echo "User can now upload properties"
    else
        echo "❌ Registration failed"
    fi
else
    echo "✅ User already registered - can upload properties directly"
fi

echo ""
echo "✅ Test completed!"
