# CRM ENQUIRY MANAGEMENT - ROLE-BASED ACCESS CURL COMMANDS

## AUTHENTICATION TOKENS
# Admin Token
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjMwZWM5OWU0NDM4YzhlNGE3M2IzZSIsImlhdCI6MTc2ODI4NDQxMywiZXhwIjoxNzY4ODg5MjEzfQ.IvsF9Us4OBbV_IfqUNVsrQYSAbq09EaXeRQGQepbHAY"

# Employee Token (replace with actual employee token)
EMPLOYEE_TOKEN="YOUR_EMPLOYEE_TOKEN_HERE"

## ============================================
## 1. HOME LOAN ENQUIRIES CRM OPERATIONS
## ============================================

# Get all home loan enquiries (Admin/Employee with home_loan_enquiries permission)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/home_loan?page=1&limit=10&status=pending"

# Get home loan enquiries analytics
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/home_loan/analytics"

# Filter home loan enquiries by priority
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/home_loan?priority=high&status=pending"

## ============================================
## 2. INTERIOR DESIGN ENQUIRIES CRM OPERATIONS  
## ============================================

# Get all interior design enquiries
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/interior_design?page=1&limit=10"

# Get interior design analytics
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/interior_design/analytics"

# Filter by status
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/interior_design?status=in_progress"

## ============================================
## 3. PROPERTY VALUATION ENQUIRIES CRM OPERATIONS
## ============================================

# Get all property valuation enquiries
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/property_valuation?page=1&limit=10"

# Get property valuation analytics  
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/property_valuation/analytics"

## ============================================
## 4. VASTU CALCULATION ENQUIRIES CRM OPERATIONS
## ============================================

# Get all vastu calculation enquiries
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/vastu_calculation?page=1&limit=10"

# Get vastu calculation analytics
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/vastu_calculation/analytics"

## ============================================
## 5. RENT AGREEMENT ENQUIRIES CRM OPERATIONS
## ============================================

# Get all rent agreement enquiries
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/rent_agreement?page=1&limit=10"

# Get rent agreement analytics
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/rent_agreement/analytics"

## ============================================
## 6. ROLE-BASED PERMISSION MANAGEMENT
## ============================================

# Assign enquiry type permissions to a role (Admin only)
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/role/ROLE_ID/permissions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiryTypes": ["home_loan", "interior_design"],
    "actions": ["read", "update"]
  }'

# Get employee enquiry permissions (Admin only)  
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/employee/EMPLOYEE_ID/permissions"

## ============================================
## 7. ENQUIRY MANAGEMENT OPERATIONS (CRM)
## ============================================

# Get specific enquiry details
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID"

# Assign enquiry to employee (Admin only)
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/assign" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "priority": "high"
  }'

# Update enquiry status (Employee/Admin)
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/status" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "adminNotes": "Started processing this enquiry",
    "followUpDate": "2026-01-20T10:00:00Z"
  }'

# Add communication log (Employee/Admin)
curl -X POST "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/communication" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Called customer to discuss home loan requirements",
    "communicationType": "call",
    "response": "Customer provided all required documents"
  }'

# Resolve enquiry (Employee/Admin)
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/ENQUIRY_ID/resolve" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolutionNotes": "Home loan application successfully submitted to bank. Reference number: HL123456"
  }'

## ============================================
## 8. EMPLOYEE DASHBOARD ENQUIRIES
## ============================================

# Get my assigned enquiries (Employee)
curl -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/my-enquiries"

# Get my assigned home loan enquiries only
curl -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/home_loan"

## ============================================
## 9. ADVANCED FILTERING & SEARCH
## ============================================

# Get enquiries with multiple filters
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries/type/interior_design?status=pending&priority=high&page=1&limit=5"

# Get overdue enquiries (with follow-up date in past)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries?followUpDate=overdue"

# Get unassigned enquiries
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://nk5.yaatrabuddy.com/api/enquiries?assignedToEmployee=null&status=pending"

## ============================================
## 10. BULK OPERATIONS (Admin)
## ============================================

# Bulk assign enquiries to employee
curl -X PUT "https://nk5.yaatrabuddy.com/api/enquiries/bulk/assign" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enquiryIds": ["ID1", "ID2", "ID3"],
    "employeeId": "EMPLOYEE_ID",
    "priority": "medium"
  }'

## ============================================
## ROLE PERMISSION EXAMPLES
## ============================================

# Create Home Loan Specialist Role
curl -X POST "https://nk5.yaatrabuddy.com/api/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Loan Specialist",
    "description": "Handles home loan enquiries only",
    "permissions": [
      {
        "module": "home_loan_enquiries",
        "actions": ["read", "update"]
      }
    ]
  }'

# Create Interior Design Manager Role  
curl -X POST "https://nk5.yaatrabuddy.com/api/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Interior Design Manager", 
    "description": "Manages interior design enquiries",
    "permissions": [
      {
        "module": "interior_design_enquiries",
        "actions": ["read", "update", "delete"]
      }
    ]
  }'

# Create Property Valuation Expert Role
curl -X POST "https://nk5.yaatrabuddy.com/api/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Property Valuation Expert",
    "description": "Handles property valuation enquiries",
    "permissions": [
      {
        "module": "property_valuation_enquiries", 
        "actions": ["read", "update"]
      }
    ]
  }'

# Create All Enquiry Manager Role (Senior Staff)
curl -X POST "https://nk5.yaatrabuddy.com/api/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Enquiry Manager",
    "description": "Can handle all types of enquiries",
    "permissions": [
      { "module": "home_loan_enquiries", "actions": ["read", "update"] },
      { "module": "interior_design_enquiries", "actions": ["read", "update"] },
      { "module": "property_valuation_enquiries", "actions": ["read", "update"] },
      { "module": "vastu_calculation_enquiries", "actions": ["read", "update"] },
      { "module": "rent_agreement_enquiries", "actions": ["read", "update"] }
    ]
  }'

## ============================================
## RESPONSE STRUCTURE EXAMPLES
## ============================================

# Typical enquiry list response:
# {
#   "message": "home_loan enquiries fetched successfully",
#   "enquiries": [...],
#   "pagination": {
#     "currentPage": 1,
#     "totalPages": 3, 
#     "totalCount": 25,
#     "hasNext": true,
#     "hasPrev": false
#   }
# }

# Typical analytics response:
# {
#   "message": "home_loan analytics fetched successfully",
#   "analytics": {
#     "enquiryType": "home_loan",
#     "totalEnquiries": 25,
#     "statusBreakdown": [
#       {"_id": "pending", "count": 15},
#       {"_id": "in_progress", "count": 8}, 
#       {"_id": "completed", "count": 2}
#     ],
#     "priorityBreakdown": [...],
#     "monthlyTrends": [...]
#   }
# }