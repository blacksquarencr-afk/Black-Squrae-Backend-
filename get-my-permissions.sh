#!/bin/bash

# Employee Get Own Permissions - Quick Reference Script
# Usage: ./get-my-permissions.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:5000/api}"
JQ_INSTALLED=$(command -v jq &> /dev/null && echo "yes" || echo "no")

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    Employee Get Own Permissions - Quick Check          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

separator() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Check jq installation
check_jq() {
    if [ "$JQ_INSTALLED" != "yes" ]; then
        print_error "jq is not installed. Installing..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        elif command -v brew &> /dev/null; then
            brew install jq
        else
            print_error "Cannot auto-install jq. Please install manually: https://jqlang.github.io/jq/download/"
            exit 1
        fi
    fi
}

# Step 1: Login
login() {
    print_header
    print_step "STEP 1: Employee Login"
    separator
    
    read -p "Enter email: " EMAIL
    read -sp "Enter password: " PASSWORD
    echo ""
    echo ""
    
    print_info "Logging in to $API_URL..."
    
    RESPONSE=$(curl -s -X POST "$API_URL/employees/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
    
    # Extract token and employee ID
    if command -v jq &> /dev/null; then
        TOKEN=$(echo $RESPONSE | jq -r '.token // empty')
        EMPLOYEE_ID=$(echo $RESPONSE | jq -r '.data._id // empty')
        EMPLOYEE_NAME=$(echo $RESPONSE | jq -r '.data.name // empty')
    else
        TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        EMPLOYEE_ID=$(echo $RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
        print_error "Login failed"
        echo $RESPONSE | jq '.' 2>/dev/null || echo $RESPONSE
        exit 1
    fi
    
    print_success "Login successful"
    print_info "Employee: $EMPLOYEE_NAME (ID: $EMPLOYEE_ID)"
    echo ""
}

# Step 2: Get own permissions
get_permissions() {
    print_step "STEP 2: Fetching Your Permissions"
    separator
    
    PROFILE=$(curl -s -X GET "$API_URL/employees/$EMPLOYEE_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    # Check if successful
    SUCCESS=$(echo $PROFILE | jq -r '.success // false')
    
    if [ "$SUCCESS" != "true" ]; then
        print_error "Failed to fetch profile"
        echo $PROFILE | jq '.' 2>/dev/null || echo $PROFILE
        exit 1
    fi
    
    print_success "Profile fetched successfully"
    echo ""
}

# Step 3: Display permissions
display_permissions() {
    print_step "STEP 3: Your Role & Permissions"
    separator
    
    ROLE_NAME=$(echo $PROFILE | jq -r '.data.role.name')
    ROLE_ID=$(echo $PROFILE | jq -r '.data.role._id')
    PERMISSIONS=$(echo $PROFILE | jq '.data.role.permissions')
    
    print_info "Role Name: $ROLE_NAME"
    print_info "Role ID: $ROLE_ID"
    echo ""
    
    echo -e "${YELLOW}Permissions:${NC}"
    echo $PERMISSIONS | jq -r '.[] | "  • Module: \(.module)\n    Actions: \(.actions | join(", "))"'
    echo ""
}

# Step 4: Check specific permission
check_permission() {
    echo ""
    print_step "STEP 4: Check Specific Permission"
    separator
    
    read -p "Enter module name to check (e.g., career-applications): " MODULE
    read -p "Enter action to check (e.g., read): " ACTION
    
    HAS_PERMISSION=$(echo $PROFILE | jq ".data.role.permissions[] | select(.module == \"$MODULE\") | select(.actions[] == \"$ACTION\")")
    
    if [ -z "$HAS_PERMISSION" ] || [ "$HAS_PERMISSION" == "null" ]; then
        print_error "You do NOT have '$ACTION' permission for '$MODULE' module"
    else
        print_success "You HAVE '$ACTION' permission for '$MODULE' module"
        echo ""
        echo "Permission Details:"
        echo $HAS_PERMISSION | jq '.'
    fi
    echo ""
}

# Step 5: Export report
export_report() {
    echo ""
    print_step "STEP 5: Export Permission Report"
    separator
    
    TIMESTAMP=$(date +%s)
    FILENAME="employee_permissions_${TIMESTAMP}.json"
    
    echo $PROFILE | jq '{
        name: .data.name,
        email: .data.email,
        role: .data.role.name,
        permissions: .data.role.permissions,
        exported_at: now | todate
    }' > "$FILENAME"
    
    print_success "Report exported to: $FILENAME"
    echo ""
}

# Step 6: Show available modules
show_available_modules() {
    echo ""
    print_step "STEP 6: Available Permission Modules"
    separator
    
    MODULES=$(curl -s -X GET "$API_URL/role/permissions" \
        -H "Content-Type: application/json")
    
    echo "Available modules in system:"
    echo $MODULES | jq -r '.data[] | "  • \(.module): \(.actions | join(", "))"' 2>/dev/null || print_info "Could not fetch available modules"
    echo ""
}

# Step 7: Interactive menu
interactive_menu() {
    while true; do
        echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}What would you like to do?${NC}"
        echo "  1) Check another permission"
        echo "  2) Export report"
        echo "  3) View available modules"
        echo "  4) Logout and Exit"
        echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
        read -p "Enter choice (1-4): " CHOICE
        
        case $CHOICE in
            1)
                check_permission
                ;;
            2)
                export_report
                ;;
            3)
                show_available_modules
                ;;
            4)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice"
                ;;
        esac
    done
}

# Main flow
main() {
    check_jq
    login
    get_permissions
    display_permissions
    check_permission
    export_report
    show_available_modules
    interactive_menu
}

# Run
main
