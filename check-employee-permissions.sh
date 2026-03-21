#!/bin/bash

# ============================================================================
# EMPLOYEE PERMISSIONS CHECKER
# ============================================================================
# Interactive script to check employee permissions based on role
# Usage: ./check-employee-permissions.sh
# ============================================================================

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
BASE_URL="http://localhost:5000/api"
TOKEN=""
EMPLOYEE_ID=""
EMPLOYEE_NAME=""

# Print header
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║          EMPLOYEE PERMISSIONS CHECKER v1.0                     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print section
print_section() {
    echo -e ""
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

# Error message
error() {
    echo -e "${RED}✗ Error: $1${NC}"
}

# Success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Info message
info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Prompt user
prompt() {
    read -p "$(echo -e ${CYAN}$1${NC}): " -r
    echo "$REPLY"
}

# Login
do_login() {
    print_section "Step 1: Employee Login"
    
    read -p "$(echo -e ${CYAN}Enter API Base URL (default: $BASE_URL)${NC}): " -r input
    BASE_URL="${input:=$BASE_URL}"
    
    EMAIL=$(prompt "Enter employee email")
    PASSWORD=$(prompt "Enter employee password")
    
    info "Logging in with email: $EMAIL"
    
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/employees/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
    
    if [ -z "$TOKEN" ]; then
        error "Login failed! Check your credentials."
        echo $LOGIN_RESPONSE | jq '.'
        exit 1
    fi
    
    EMPLOYEE_ID=$(echo $LOGIN_RESPONSE | jq -r '.data._id')
    EMPLOYEE_NAME=$(echo $LOGIN_RESPONSE | jq -r '.data.name')
    
    success "Logged in as: $EMPLOYEE_NAME"
    echo -e "${YELLOW}Token: ${TOKEN:0:50}...${NC}"
}

# Get employee permissions
get_employee_permissions() {
    print_section "Step 2: Fetching Your Profile & Permissions"
    
    info "Employee ID: $EMPLOYEE_ID"
    
    PROFILE=$(curl -s -X GET "$BASE_URL/employees/$EMPLOYEE_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    # Check if successful
    SUCCESS=$(echo $PROFILE | jq -r '.success')
    if [ "$SUCCESS" != "true" ]; then
        error "Failed to fetch profile"
        echo $PROFILE | jq '.'
        return 1
    fi
    
    success "Profile fetched successfully"
}

# Display role and permissions
display_permissions() {
    print_section "Step 3: Your Role & Permissions"
    
    ROLE_NAME=$(echo $PROFILE | jq -r '.data.role.name')
    echo -e "${CYAN}Role:${NC} ${YELLOW}$ROLE_NAME${NC}"
    echo ""
    echo -e "${CYAN}Assigned Permissions:${NC}"
    echo ""
    
    echo $PROFILE | jq -r '.data.role.permissions[] | 
        @text "\(.module | ascii_upcase):\n  └─ Actions: \(.actions | join(", "))"' | \
    while IFS= read -r line; do
        echo -e "  ${GREEN}$line${NC}"
    done
    
    echo ""
}

# Check specific permission
check_specific_permission() {
    print_section "Step 4: Check Specific Permission"
    
    MODULE=$(prompt "Enter module name (or press Enter to skip)")
    
    if [ -z "$MODULE" ]; then
        return
    fi
    
    ACTION=$(prompt "Enter action (create/read/update/delete)")
    
    HAS_PERM=$(echo $PROFILE | jq --arg module "$MODULE" --arg action "$ACTION" \
        '.data.role.permissions[] | 
        select(.module == $module) | 
        select(.actions[] == $action)')
    
    if [ -z "$HAS_PERM" ]; then
        error "You do NOT have '$ACTION' permission for '$MODULE' module"
    else
        success "You HAVE '$ACTION' permission for '$MODULE' module"
    fi
    echo ""
}

# Display available modules
show_available_modules() {
    print_section "Available Permission Modules"
    
    MODULES=$(curl -s -X GET "$BASE_URL/role/permissions")
    
    echo $MODULES | jq -r '.data.modules[] | 
        @text "• \(.value | ascii_upcase)\n  \(.label) - \(.description)"' | \
    while IFS= read -r line; do
        echo -e "  ${CYAN}$line${NC}"
    done
    
    echo ""
}

# Export permission report
export_report() {
    print_section "Export Permission Report"
    
    REPORT=$(curl -s -X GET "$BASE_URL/employees/$EMPLOYEE_ID" \
        -H "Authorization: Bearer $TOKEN" | \
        jq '{
            timestamp: now,
            employee: {
                name: .data.name,
                email: .data.email,
                department: .data.department,
                id: .data._id
            },
            role: {
                name: .data.role.name,
                id: .data.role._id,
                permissions: .data.role.permissions
            }
        }')
    
    FILENAME="employee_permissions_$(date +%s).json"
    echo $REPORT | jq '.' > "$FILENAME"
    
    success "Report exported to: $FILENAME"
    echo ""
}

# Display permission summary table
display_summary_table() {
    print_section "Permission Summary"
    
    echo -e "${CYAN}Module${NC} | ${CYAN}Actions${NC}"
    echo "─────────────────────────────────────────────"
    
    echo $PROFILE | jq -r '.data.role.permissions[] | 
        @text "\(.module) | \(.actions | join(", "))"' | \
    while IFS= read -r line; do
        echo -e "${GREEN}$line${NC}"
    done
    echo ""
}

# Interactive menu
show_menu() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}What would you like to do?${NC}"
    echo ""
    echo "  1) Check specific permission"
    echo "  2) Show available modules"
    echo "  3) Display permission summary table"
    echo "  4) Export permission report"
    echo "  5) Refresh permissions"
    echo "  6) Login with different account"
    echo "  7) Exit"
    echo ""
    
    read -p "$(echo -e ${CYAN}Enter choice [1-7]:${NC} )" -r choice
    
    case $choice in
        1) check_specific_permission; show_menu ;;
        2) show_available_modules; show_menu ;;
        3) display_summary_table; show_menu ;;
        4) export_report; show_menu ;;
        5) get_employee_permissions; display_permissions; show_menu ;;
        6) do_login; get_employee_permissions; display_permissions; show_menu ;;
        7) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
        *) error "Invalid choice"; show_menu ;;
    esac
}

# Main flow
main() {
    clear
    print_header
    
    # Check if curl and jq are installed
    if ! command -v curl &> /dev/null; then
        error "curl is not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "jq is not installed"
        exit 1
    fi
    
    do_login
    get_employee_permissions
    display_permissions
    show_menu
}

# Run main function
main
