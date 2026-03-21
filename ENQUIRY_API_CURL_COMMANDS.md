# ENQUIRY API ENDPOINTS - CURL EXAMPLES

## 1. HOME LOAN ENQUIRY
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/create" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiryType": "home_loan",
    "fullName": "John Smith",
    "email": "john.smith@example.com",
    "mobileNumber": "9876543210",
    "homeLoan": {
      "panNumber": "ABCDE1234F",
      "agreeToTerms": true
    }
  }'

## 2. INTERIOR DESIGN ENQUIRY
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/create" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiryType": "interior_design",
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "mobileNumber": "9876543211",
    "interiorDesign": {
      "propertyType": "3BHK Apartment",
      "budget": "5-10 Lakhs",
      "propertyLocation": "Sector 62, Noida",
      "additionalRequirements": "Modern minimalist design with smart home automation"
    }
  }'

## 3. PROPERTY VALUATION ENQUIRY
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/create" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiryType": "property_valuation",
    "fullName": "Robert Johnson",
    "email": "robert.j@example.com",
    "mobileNumber": "9876543212",
    "propertyValuation": {
      "propertyType": "Independent Villa",
      "projectLocality": "DLF Phase 2",
      "area": "2500 sq ft",
      "cityName": "Gurgaon",
      "location": "Golf Course Road, Gurgaon, Haryana"
    }
  }'

## 4. VASTU CALCULATION ENQUIRY (with file upload)
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/create" \
  -F "enquiryType=vastu_calculation" \
  -F "fullName=Priya Sharma" \
  -F "email=priya.sharma@example.com" \
  -F "mobileNumber=9876543213" \
  -F "vastuCalculation[propertyType]=Independent House" \
  -F "vastuCalculation[plotArea]=4000 sq ft" \
  -F "vastuCalculation[constructionStatus]=planned" \
  -F "attachments=@/path/to/floor_plan.pdf"

## 5. RENT AGREEMENT ENQUIRY
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/create" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiryType": "rent_agreement",
    "fullName": "Amit Patel",
    "email": "amit.patel@example.com",
    "mobileNumber": "9876543214",
    "rentAgreement": {
      "propertyAddress": "Flat 101, Tower A, Supertech Emerald Court, Sector 93A, Noida",
      "landlordName": "Rajesh Kumar",
      "tenantName": "Amit Patel",
      "monthlyRent": 25000,
      "securityDeposit": 50000,
      "leaseDuration": "11 months",
      "agreementType": "new"
    }
  }'

## ADMIN APIs (Require Admin Token)

# Get admin token first
ADMIN_TOKEN=$(curl -X POST "https://nk5.yaatrabuddy.com/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "blacksquare@gmail.com", "password": "blacksquare@gmail.com"}' | jq -r '.token')

# Get all enquiries
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries?page=1&limit=10&status=pending"

# Assign enquiry to employee
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/assign" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "priority": "high"
  }'

# Get enquiry analytics
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/analytics/dashboard"

## EMPLOYEE/USER APIs (Require User Token)

# Get user token first
USER_TOKEN=$(curl -X POST "https://nk5.yaatrabuddy.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}' | jq -r '.token')

# Get my enquiries
curl -H "Authorization: Bearer $USER_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/my-enquiries"

# Get specific enquiry
curl -H "Authorization: Bearer $USER_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID"

# Update enquiry status (Employee only)
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/status" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "adminNotes": "Started working on this enquiry",
    "followUpDate": "2026-01-20T10:00:00Z"
  }'

# Add communication log
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/communication" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Called the customer to discuss requirements",
    "communicationType": "call",
    "response": "Customer interested, scheduling site visit"
  }'

# Resolve enquiry
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/resolve" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolutionNotes": "Successfully completed the home loan application process"
  }'

## Query Parameters for Filtering:
# - page: Page number (default: 1)
# - limit: Records per page (default: 20)
# - enquiryType: home_loan, interior_design, property_valuation, vastu_calculation, rent_agreement
# - status: pending, in_progress, completed, cancelled
# - priority: low, medium, high, urgent
# - assignedToEmployee: Employee ID