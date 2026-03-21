#!/bin/bash

# Feedback API Testing Script
# Make sure to update the tokens and IDs with actual values

# Configuration
API_URL="http://localhost:3000/api/feedback"
USER_TOKEN="your-user-jwt-token-here"
EMPLOYEE_TOKEN="your-employee-jwt-token-here"

echo "========================================="
echo "FEEDBACK API TESTING"
echo "========================================="

# 1. Submit Feedback (User)
echo -e "\n1. Testing: Submit Feedback (User)"
FEEDBACK_ID=$(curl -s -X POST "${API_URL}/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{
    "issueType": "Problem with My Property Listing",
    "issueDetails": "My property is not appearing in search results even though it was approved 3 days ago.",
    "contactInfo": {
      "name": "Nikhil Kashyap",
      "email": "bhoomi.nikhilkashyap@gmail.com",
      "phone": "7737470723"
    }
  }' | jq -r '.data._id')

echo "Created Feedback ID: ${FEEDBACK_ID}"

# 2. Get User's Own Feedbacks
echo -e "\n2. Testing: Get User's Own Feedbacks"
curl -s -X GET "${API_URL}/my-feedbacks" \
  -H "Authorization: Bearer ${USER_TOKEN}" | jq

# 3. Get All Feedbacks (Employee/Admin)
echo -e "\n3. Testing: Get All Feedbacks (Employee)"
curl -s -X GET "${API_URL}/all?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" | jq

# 4. Get Feedback by ID (Employee)
echo -e "\n4. Testing: Get Feedback by ID"
curl -s -X GET "${API_URL}/${FEEDBACK_ID}" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" | jq

# 5. Assign Feedback to Employee
EMPLOYEE_ID="your-employee-id-here"
echo -e "\n5. Testing: Assign Feedback to Employee"
curl -s -X POST "${API_URL}/${FEEDBACK_ID}/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
  -d "{
    \"assignedTo\": \"${EMPLOYEE_ID}\",
    \"priority\": \"high\"
  }" | jq

# 6. Get My Assigned Feedbacks (Employee)
echo -e "\n6. Testing: Get My Assigned Feedbacks"
curl -s -X GET "${API_URL}/assigned?status=assigned" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" | jq

# 7. Update Feedback Status
echo -e "\n7. Testing: Update Feedback Status to In-Progress"
curl -s -X PATCH "${API_URL}/${FEEDBACK_ID}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
  -d '{
    "status": "in-progress"
  }' | jq

# 8. Add Internal Note
echo -e "\n8. Testing: Add Internal Note"
curl -s -X POST "${API_URL}/${FEEDBACK_ID}/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
  -d '{
    "note": "Checked the property listing. The issue was due to indexing delay. Re-indexed manually."
  }' | jq

# 9. Resolve Feedback
echo -e "\n9. Testing: Resolve Feedback"
curl -s -X POST "${API_URL}/${FEEDBACK_ID}/resolve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
  -d '{
    "resolution": "The property has been re-indexed and is now visible in search results. Please check and confirm."
  }' | jq

# 10. Rate Feedback (User)
echo -e "\n10. Testing: User Rates Feedback"
curl -s -X POST "${API_URL}/${FEEDBACK_ID}/rate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{
    "rating": 5,
    "userFeedback": "Great support! The issue was resolved quickly."
  }' | jq

# 11. Get Feedback Statistics
echo -e "\n11. Testing: Get Feedback Statistics"
curl -s -X GET "${API_URL}/stats/overview" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" | jq

# 12. Delete Feedback (Admin)
echo -e "\n12. Testing: Delete Feedback"
curl -s -X DELETE "${API_URL}/${FEEDBACK_ID}" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" | jq

echo -e "\n========================================="
echo "FEEDBACK API TESTING COMPLETED"
echo "========================================="
