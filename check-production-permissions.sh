#!/bin/bash

# Production Employee Permissions Checker
# For: https://backend.blacksquare.estate

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration - PRODUCTION
API_URL="https://backend.blacksquare.estate/api"

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Production Employee Permissions Checker            ║${NC}"
echo -e "${BLUE}║   BlackSquare Backend: backend.blacksquare.estate     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get credentials
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""
echo ""

# Step 1: Login
echo -e "${CYAN}▶ Step 1: Logging in...${NC}"
echo "─────────────────────────────────────────────────────────"

LOGIN=$(curl -s --location "$API_URL/employees/login" \
  --header 'Content-Type: application/json' \
  --data-raw "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

# Extract token and data
TOKEN=$(echo $LOGIN | jq -r '.token // empty')
EMPLOYEE_ID=$(echo $LOGIN | jq -r '.data.employee._id // empty')
EMPLOYEE_NAME=$(echo $LOGIN | jq -r '.data.employee.name // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo $LOGIN | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo -e "${YELLOW}Employee: $EMPLOYEE_NAME${NC}"
echo -e "${YELLOW}ID: $EMPLOYEE_ID${NC}"
echo -e "${YELLOW}Token: ${TOKEN:0:50}...${NC}"
echo ""

# Step 2: Get Permissions
echo -e "${CYAN}▶ Step 2: Fetching your permissions...${NC}"
echo "─────────────────────────────────────────────────────────"

PROFILE=$(curl -s --location "$API_URL/employees/$EMPLOYEE_ID" \
  --header "Authorization: Bearer $TOKEN")

# Check success
SUCCESS=$(echo $PROFILE | jq -r '.success // false')
if [ "$SUCCESS" != "true" ]; then
  echo -e "${RED}✗ Failed to fetch profile${NC}"
  echo $PROFILE | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Profile fetched successfully${NC}"
echo ""

# Step 3: Display Role & Permissions
echo -e "${CYAN}▶ Step 3: Your Role & Permissions${NC}"
echo "─────────────────────────────────────────────────────────"

ROLE_NAME=$(echo $PROFILE | jq -r '.data.role.name')
ROLE_ID=$(echo $PROFILE | jq -r '.data.role._id')

echo -e "${GREEN}Role:${NC} ${YELLOW}$ROLE_NAME${NC}"
echo -e "${GREEN}Role ID:${NC} $ROLE_ID"
echo ""

echo -e "${YELLOW}Your Permissions:${NC}"
echo $PROFILE | jq -r '.data.role.permissions[] | "  ${CYAN}•${NC} Module: \(.module)\n    Actions: \(.actions | join(", "))"'
echo ""

# Step 4: Interactive Menu
while true; do
  echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}What would you like to do?${NC}"
  echo "  1) Check specific permission"
  echo "  2) Export permission report"
  echo "  3) View raw JSON response"
  echo "  4) Exit"
  echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
  read -p "Choice (1-4): " CHOICE

  case $CHOICE in
    1)
      echo ""
      read -p "Enter module name (e.g., career-applications): " MODULE
      read -p "Enter action (e.g., read): " ACTION
      
      HAS_PERM=$(echo $PROFILE | jq ".data.role.permissions[] | select(.module == \"$MODULE\") | select(.actions[] == \"$ACTION\")")
      
      if [ -z "$HAS_PERM" ] || [ "$HAS_PERM" == "null" ]; then
        echo -e "${RED}✗ You do NOT have '$ACTION' permission for '$MODULE'${NC}"
      else
        echo -e "${GREEN}✓ You HAVE '$ACTION' permission for '$MODULE'${NC}"
        echo ""
        echo "Permission details:"
        echo $HAS_PERM | jq '.'
      fi
      echo ""
      ;;
    
    2)
      FILENAME="employee_permissions_$(date +%s).json"
      echo $PROFILE | jq '{
        name: .data.name,
        email: .data.email,
        department: .data.department,
        role: .data.role.name,
        permissions: .data.role.permissions,
        exported_at: now | todate
      }' > "$FILENAME"
      echo -e "${GREEN}✓ Exported to: $FILENAME${NC}"
      echo ""
      ;;
    
    3)
      echo ""
      echo "Raw JSON Response:"
      echo $PROFILE | jq '.'
      echo ""
      ;;
    
    4)
      echo -e "${GREEN}Goodbye!${NC}"
      exit 0
      ;;
    
    *)
      echo -e "${RED}Invalid choice${NC}"
      echo ""
      ;;
  esac
done
