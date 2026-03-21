#!/usr/bin/env node

/**
 * EMPLOYEE PERMISSIONS CHECKER - Node.js Version
 * 
 * Interactive CLI tool to check employee permissions based on role
 * 
 * Usage:
 *   node check-employee-permissions.mjs
 *   node check-employee-permissions.mjs --email user@example.com --password pwd
 *   node check-employee-permissions.mjs --check-permission "enquiries:read"
 */

import fetch from 'node-fetch';
import readline from 'readline';
import chalk from 'chalk';

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// State
let token = null;
let employeeId = null;
let employeeName = null;
let employeeProfile = null;

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisified question
const question = (query) => new Promise(resolve => {
    rl.question(chalk.cyan(`${query}: `), resolve);
});

// Print header
function printHeader() {
    console.log(chalk.blue('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║          EMPLOYEE PERMISSIONS CHECKER v1.0 (Node.js)           ║'));
    console.log(chalk.blue('╚════════════════════════════════════════════════════════════════╝'));
    console.log('');
}

// Print section
function printSection(title) {
    console.log('');
    console.log(chalk.cyan(`▶ ${title}`));
    console.log(chalk.cyan('═══════════════════════════════════════════════════════════════'));
}

// Helper functions
function error(msg) {
    console.log(chalk.red(`✗ Error: ${msg}`));
}

function success(msg) {
    console.log(chalk.green(`✓ ${msg}`));
}

function info(msg) {
    console.log(chalk.yellow(`ℹ ${msg}`));
}

// API calls
async function login(email, password) {
    try {
        info(`Logging in with email: ${email}`);
        
        const response = await fetch(`${BASE_URL}/employees/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            error(data.message || 'Login failed');
            return false;
        }
        
        token = data.token;
        employeeId = data.data._id;
        employeeName = data.data.name;
        
        success(`Logged in as: ${employeeName}`);
        console.log(chalk.yellow(`Token: ${token.substring(0, 50)}...`));
        
        return true;
    } catch (err) {
        error(err.message);
        return false;
    }
}

async function fetchEmployeeProfile() {
    try {
        info(`Fetching profile for employee: ${employeeId}`);
        
        const response = await fetch(`${BASE_URL}/employees/${employeeId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            error(data.message || 'Failed to fetch profile');
            return false;
        }
        
        employeeProfile = data.data;
        success('Profile fetched successfully');
        return true;
    } catch (err) {
        error(err.message);
        return false;
    }
}

async function fetchAvailableModules() {
    try {
        const response = await fetch(`${BASE_URL}/role/permissions`);
        const data = await response.json();
        return data.data || null;
    } catch (err) {
        error(err.message);
        return null;
    }
}

// Display functions
function displayPermissions() {
    printSection('Your Role & Permissions');
    
    const role = employeeProfile.role;
    console.log(chalk.cyan(`Role: `) + chalk.yellow(role.name));
    console.log('');
    console.log(chalk.cyan('Assigned Permissions:'));
    console.log('');
    
    role.permissions.forEach((perm, idx) => {
        const actions = perm.actions.join(', ');
        console.log(chalk.green(`  ${idx + 1}. ${perm.module.toUpperCase()}`));
        console.log(chalk.green(`     └─ Actions: ${actions}`));
    });
    console.log('');
}

function displayPermissionTable() {
    printSection('Permission Summary Table');
    
    console.log(chalk.cyan('Module') + ' | ' + chalk.cyan('Actions'));
    console.log('─'.repeat(50));
    
    employeeProfile.role.permissions.forEach(perm => {
        const module = perm.module.padEnd(20);
        const actions = perm.actions.join(', ');
        console.log(chalk.green(`${module} | ${actions}`));
    });
    console.log('');
}

async function displayAvailableModules() {
    printSection('Available Permission Modules');
    
    const modules = await fetchAvailableModules();
    if (!modules) return;
    
    modules.modules.forEach((mod, idx) => {
        console.log(chalk.cyan(`• ${mod.value.toUpperCase()}`));
        console.log(chalk.cyan(`  ${mod.label} - ${mod.description}`));
        if (idx < modules.modules.length - 1) console.log('');
    });
    console.log('');
}

// Check specific permission
async function checkPermission(module, action) {
    const perm = employeeProfile.role.permissions.find(p => p.module === module);
    
    if (!perm) {
        error(`Module '${module}' not found in your permissions`);
        return false;
    }
    
    if (!perm.actions.includes(action)) {
        error(`You do NOT have '${action}' permission for '${module}' module`);
        return false;
    }
    
    success(`You HAVE '${action}' permission for '${module}' module`);
    return true;
}

// Export report
async function exportReport() {
    printSection('Export Permission Report');
    
    const report = {
        timestamp: new Date().toISOString(),
        employee: {
            name: employeeProfile.name,
            email: employeeProfile.email,
            department: employeeProfile.department,
            id: employeeProfile._id
        },
        role: {
            name: employeeProfile.role.name,
            id: employeeProfile.role._id,
            permissions: employeeProfile.role.permissions
        }
    };
    
    const filename = `employee_permissions_${Date.now()}.json`;
    
    // Using Node.js fs
    const fs = await import('fs');
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    success(`Report exported to: ${filename}`);
    console.log('');
}

// Get user input for permission check
async function checkCustomPermission() {
    printSection('Check Specific Permission');
    
    const module = await question('Enter module name');
    if (!module) return;
    
    const action = await question('Enter action (create/read/update/delete)');
    if (!action) return;
    
    await checkPermission(module, action);
    console.log('');
}

// Interactive menu
async function showMenu() {
    console.log('');
    console.log(chalk.blue('═'.repeat(65)));
    console.log(chalk.cyan('What would you like to do?'));
    console.log('');
    console.log('  1) Check specific permission');
    console.log('  2) Show available modules');
    console.log('  3) Display permission summary table');
    console.log('  4) Export permission report');
    console.log('  5) Refresh permissions');
    console.log('  6) Login with different account');
    console.log('  7) Exit');
    console.log('');
    
    const choice = await question('Enter choice [1-7]');
    
    switch (choice) {
        case '1':
            await checkCustomPermission();
            await showMenu();
            break;
        case '2':
            await displayAvailableModules();
            await showMenu();
            break;
        case '3':
            displayPermissionTable();
            await showMenu();
            break;
        case '4':
            await exportReport();
            await showMenu();
            break;
        case '5':
            await fetchEmployeeProfile();
            displayPermissions();
            await showMenu();
            break;
        case '6':
            await doLogin();
            displayPermissions();
            await showMenu();
            break;
        case '7':
            console.log(chalk.green('Goodbye!'));
            rl.close();
            process.exit(0);
            break;
        default:
            error('Invalid choice');
            await showMenu();
    }
}

// Main login flow
async function doLogin() {
    printSection('Step 1: Employee Login');
    
    const email = await question('Enter employee email');
    const password = await question('Enter employee password');
    
    if (!await login(email, password)) {
        rl.close();
        process.exit(1);
    }
}

// Main flow
async function main() {
    console.clear();
    printHeader();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage:
  node check-employee-permissions.mjs [options]

Options:
  --email <email>              Employee email
  --password <password>        Employee password
  --check-permission <mod:act>  Check specific permission (e.g., enquiries:read)
  --export-only               Export report and exit
  --help                      Show this help message

Examples:
  node check-employee-permissions.mjs
  node check-employee-permissions.mjs --email user@test.com --password pwd123
  node check-employee-permissions.mjs --check-permission "enquiries:read"
        `);
        process.exit(0);
    }
    
    let email = null;
    let password = null;
    let checkPermOnly = null;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--email') email = args[++i];
        if (args[i] === '--password') password = args[++i];
        if (args[i] === '--check-permission') checkPermOnly = args[++i];
    }
    
    // Login
    if (email && password) {
        if (!await login(email, password)) {
            process.exit(1);
        }
    } else {
        await doLogin();
    }
    
    // Fetch profile
    if (!await fetchEmployeeProfile()) {
        process.exit(1);
    }
    
    displayPermissions();
    
    // If specific permission check requested
    if (checkPermOnly) {
        const [module, action] = checkPermOnly.split(':');
        if (module && action) {
            await checkPermission(module, action);
        }
        rl.close();
        process.exit(0);
    }
    
    // Show interactive menu
    await showMenu();
}

// Run
main().catch(err => {
    error(err.message);
    process.exit(1);
});
