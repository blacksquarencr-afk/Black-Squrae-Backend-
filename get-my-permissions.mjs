#!/usr/bin/env node

/**
 * Employee Get Own Permissions - Node.js CLI
 * 
 * Usage:
 *   node get-my-permissions.mjs
 *   node get-my-permissions.mjs --email user@example.com --password pwd123
 *   node get-my-permissions.mjs --export
 */

import fetch from 'node-fetch';
import readline from 'readline';
import fs from 'fs';
import chalk from 'chalk';

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// State
let token = null;
let employeeId = null;
let employeeName = null;
let employeeProfile = null;

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisified question
const question = (query) => new Promise(resolve => {
    rl.question(chalk.cyan(`${query}: `), resolve);
});

// Console helpers
const printHeader = () => {
    console.log(chalk.blue('╔═══════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║   Employee Get Own Permissions - Node.js CLI v1.0     ║'));
    console.log(chalk.blue('╚═══════════════════════════════════════════════════════╝'));
    console.log('');
};

const printSection = (title) => {
    console.log('');
    console.log(chalk.cyan(`▶ ${title}`));
    console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
};

const printSuccess = (msg) => console.log(chalk.green(`✓ ${msg}`));
const printError = (msg) => console.log(chalk.red(`✗ ${msg}`));
const printInfo = (msg) => console.log(chalk.yellow(`ℹ ${msg}`));

// API Functions

/**
 * Login employee
 */
async function login(email, password) {
    try {
        const response = await fetch(`${BASE_URL}/employees/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!data.success) {
            printError(data.message || 'Login failed');
            return false;
        }

        token = data.token;
        employeeId = data.data._id;
        employeeName = data.data.name;

        printSuccess(`Logged in as ${employeeName}`);
        printInfo(`Token: ${token.substring(0, 50)}...`);
        return true;
    } catch (error) {
        printError(`Login error: ${error.message}`);
        return false;
    }
}

/**
 * Get employee profile with permissions
 */
async function fetchEmployeeProfile() {
    try {
        const response = await fetch(`${BASE_URL}/employees/${employeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            printError(data.message || 'Failed to fetch profile');
            return false;
        }

        employeeProfile = data.data;
        printSuccess('Profile fetched successfully');
        return true;
    } catch (error) {
        printError(`Fetch error: ${error.message}`);
        return false;
    }
}

/**
 * Display employee permissions
 */
function displayPermissions() {
    printSection('Your Role & Permissions');

    const role = employeeProfile.role;
    
    console.log(chalk.yellow(`Role: ${role.name}`));
    console.log(chalk.yellow(`Role ID: ${role._id}`));
    console.log('');

    if (!role.permissions || role.permissions.length === 0) {
        printInfo('No permissions assigned');
        return;
    }

    console.log(chalk.yellow('Permissions:'));
    role.permissions.forEach(perm => {
        console.log(chalk.cyan(`  • Module: ${perm.module}`));
        console.log(chalk.cyan(`    Actions: ${perm.actions.join(', ')}`));
    });
}

/**
 * Check specific permission
 */
async function checkPermission(module, action) {
    const permissions = employeeProfile.role.permissions;
    const hasPermission = permissions.some(perm =>
        perm.module === module && perm.actions.includes(action)
    );

    if (hasPermission) {
        printSuccess(`You HAVE '${action}' permission for '${module}' module`);
        const perm = permissions.find(p => p.module === module);
        console.log(chalk.cyan('Permission details:'));
        console.log(chalk.gray(JSON.stringify(perm, null, 2)));
    } else {
        printError(`You do NOT have '${action}' permission for '${module}' module`);
    }
}

/**
 * Get available permission modules
 */
async function fetchAvailableModules() {
    try {
        const response = await fetch(`${BASE_URL}/role/permissions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success) {
            printError('Failed to fetch available modules');
            return [];
        }

        return data.data || [];
    } catch (error) {
        printError(`Fetch error: ${error.message}`);
        return [];
    }
}

/**
 * Display available modules
 */
async function displayAvailableModules() {
    printSection('Available Permission Modules');

    const modules = await fetchAvailableModules();

    if (modules.length === 0) {
        printInfo('No modules available');
        return;
    }

    console.log(chalk.cyan('Available modules in system:'));
    modules.forEach(mod => {
        console.log(chalk.cyan(`  • ${mod.module}: ${mod.actions.join(', ')}`));
    });
}

/**
 * Export report to JSON file
 */
function exportReport() {
    const timestamp = Date.now();
    const filename = `employee_permissions_${timestamp}.json`;

    const report = {
        name: employeeProfile.name,
        email: employeeProfile.email,
        department: employeeProfile.department,
        role: employeeProfile.role.name,
        roleId: employeeProfile.role._id,
        permissions: employeeProfile.role.permissions,
        exportedAt: new Date().toISOString()
    };

    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    printSuccess(`Report exported to: ${filename}`);
}

/**
 * Check custom permission
 */
async function checkCustomPermission() {
    printSection('Check Specific Permission');

    const module = await question('Enter module name');
    if (!module) {
        printError('Module name required');
        return;
    }

    const action = await question('Enter action (e.g., read, create, update, delete)');
    if (!action) {
        printError('Action required');
        return;
    }

    await checkPermission(module, action);
}

/**
 * Interactive menu
 */
async function showMenu() {
    while (true) {
        console.log('');
        console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
        console.log(chalk.yellow('What would you like to do?'));
        console.log('  1) Check another permission');
        console.log('  2) View available modules');
        console.log('  3) Export permission report');
        console.log('  4) Exit');
        console.log(chalk.cyan('═══════════════════════════════════════════════════════'));

        const choice = await question('Enter choice (1-4)');

        switch (choice) {
            case '1':
                await checkCustomPermission();
                break;
            case '2':
                await displayAvailableModules();
                break;
            case '3':
                exportReport();
                break;
            case '4':
                printInfo('Goodbye!');
                rl.close();
                process.exit(0);
            default:
                printError('Invalid choice');
        }
    }
}

/**
 * Do login (prompt user)
 */
async function doLogin() {
    printSection('Employee Login');

    const email = await question('Enter email');
    if (!email) {
        printError('Email required');
        process.exit(1);
    }

    const password = await question('Enter password');
    if (!password) {
        printError('Password required');
        process.exit(1);
    }

    if (!await login(email, password)) {
        process.exit(1);
    }
}

/**
 * Main flow
 */
async function main() {
    printHeader();

    // Parse command line arguments
    const args = process.argv.slice(2);
    let email = null;
    let password = null;
    let checkPermOnly = null;
    let exportOnly = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--email') email = args[++i];
        if (args[i] === '--password') password = args[++i];
        if (args[i] === '--check-permission') checkPermOnly = args[++i];
        if (args[i] === '--export') exportOnly = true;
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

    // Display permissions
    displayPermissions();

    // Export if requested
    if (exportOnly) {
        exportReport();
        rl.close();
        process.exit(0);
    }

    // Check specific permission if requested
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
    printError(err.message);
    process.exit(1);
});
