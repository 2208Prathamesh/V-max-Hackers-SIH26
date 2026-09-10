#!/usr/bin/env node
/**
 * WeatherGPT - Terminal CLI User Creation Tool
 *
 * Interactive terminal script to create a user with specified username, email,
 * role (user, farmer, authority, admin), and password.
 *
 * Usage:
 *   Interactive:
 *     npm run create-user
 *     node backend/src/scripts/createUser.js
 *
 *   Non-interactive (flags):
 *     node backend/src/scripts/createUser.js --name "Aarav Sharma" --email "aarav@example.com" --role authority --password "SecurePass123!"
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../../.env') })
dotenv.config({ path: path.join(__dirname, '../../../.env') })

import { connectDB, disconnectDB } from '../config/db.js'
import User from '../models/User.js'
import { hashPassword } from '../utils/password.js'

// ANSI colors for clean terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
}

const ROLES = {
  '1': { code: 'user', label: 'Citizen (user)', desc: 'General public weather intelligence & public warnings' },
  '2': { code: 'farmer', label: 'Farmer', desc: 'Weather forecasts, agro advisories & crop risk insights' },
  '3': { code: 'authority', label: 'Disaster Authority', desc: 'District emergency dashboard, incident publishing & active feeds' },
  '4': { code: 'admin', label: 'System Admin', desc: 'Full system management, user administration & telemetry' }
}

/**
 * Parse CLI command line flags (e.g. --name "..." --email "..." --role "...")
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const params = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      params.help = true
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        params[key] = next
        i++
      } else {
        params[key] = true
      }
    }
  }
  return params
}

function printBanner() {
  console.log(`\n${colors.cyan}${colors.bright}======================================================${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}  🌤️  WeatherGPT — Terminal User Creation Utility     ${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}======================================================${colors.reset}`)
  console.log(`${colors.gray}Easily provision Citizen, Farmer, Authority, or Admin accounts directly from the terminal.${colors.reset}\n`)
}

function printHelp() {
  printBanner()
  console.log(`${colors.bright}Usage:${colors.reset}`)
  console.log(`  npm run create-user`)
  console.log(`  node backend/src/scripts/createUser.js [OPTIONS]\n`)
  console.log(`${colors.bright}Options:${colors.reset}`)
  console.log(`  --name, --username <string>   User full name / username`)
  console.log(`  --email <string>              Valid email address`)
  console.log(`  --role <string>               Role: 'user', 'farmer', 'authority', 'admin'`)
  console.log(`  --password <string>           Account password (min 6 characters)`)
  console.log(`  --language <string>           Preferred language: 'en', 'mr', 'hi' (default: en)`)
  console.log(`  -y, --yes                     Skip confirmation prompt`)
  console.log(`  -h, --help                    Show this help screen\n`)
  console.log(`${colors.bright}Examples:${colors.reset}`)
  console.log(`  ${colors.green}npm run create-user${colors.reset} (interactive walkthrough)`)
  console.log(`  ${colors.green}npm run create-user -- --name "Officer Patil" --email "patil@disaster.gov.in" --role authority --password "Patil@2026"${colors.reset}\n`)
}

/**
 * Validate an email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Resolve role string or number to valid enum
 */
function resolveRole(inputRole) {
  if (!inputRole) return null
  const trimmed = inputRole.toString().trim().toLowerCase()
  if (ROLES[trimmed]) return ROLES[trimmed].code
  if (trimmed === 'citizen') return 'user'
  if (trimmed === 'user') return 'user'
  if (trimmed === 'farmer') return 'farmer'
  if (trimmed === 'authority' || trimmed === 'disaster') return 'authority'
  if (trimmed === 'admin' || trimmed === 'administrator') return 'admin'
  return null
}

async function promptUserInteractive(rl, cliParams) {
  // 1. Username / Name
  let name = cliParams.name || cliParams.username
  while (!name || !name.trim()) {
    name = await rl.question(`${colors.bright}1. Enter Full Name / Username:${colors.reset} `)
    if (!name.trim()) {
      console.log(`   ${colors.red}❌ Name cannot be empty. Please enter a valid name.${colors.reset}`)
    }
  }
  name = name.trim()

  // 2. Email
  let email = cliParams.email
  while (!email || !isValidEmail(email.trim())) {
    email = await rl.question(`${colors.bright}2. Enter Email Address:${colors.reset} `)
    if (!isValidEmail(email.trim())) {
      console.log(`   ${colors.red}❌ Please provide a valid email format (e.g. user@example.com).${colors.reset}`)
      email = null
    }
  }
  email = email.trim().toLowerCase()

  // 3. Role Option
  let role = resolveRole(cliParams.role)
  if (!role) {
    console.log(`\n${colors.bright}3. Select User Role:${colors.reset}`)
    Object.entries(ROLES).forEach(([key, info]) => {
      console.log(`   ${colors.yellow}[${key}]${colors.reset} ${colors.bright}${info.label.padEnd(20)}${colors.reset} ${colors.gray}— ${info.desc}${colors.reset}`)
    })

    while (!role) {
      const choice = await rl.question(`   ${colors.cyan}Enter option [1-4] or role name (default: 1):${colors.reset} `)
      const selected = choice.trim() || '1'
      role = resolveRole(selected)
      if (!role) {
        console.log(`   ${colors.red}❌ Invalid option. Please enter 1, 2, 3, or 4 (or role name).${colors.reset}`)
      }
    }
  }

  // 4. Password
  let password = cliParams.password
  while (!password || password.length < 6) {
    password = await rl.question(`\n${colors.bright}4. Enter Password (min 6 chars):${colors.reset} `)
    if (password.length < 6) {
      console.log(`   ${colors.red}❌ Password must be at least 6 characters long.${colors.reset}`)
      password = null
      continue
    }

    if (!cliParams.password) {
      const confirmPassword = await rl.question(`   ${colors.bright}Confirm Password:${colors.reset} `)
      if (password !== confirmPassword) {
        console.log(`   ${colors.red}❌ Passwords do not match. Please try again.${colors.reset}`)
        password = null
      }
    }
  }

  // 5. Preferred Language
  let language = cliParams.language || 'en'
  const isNonInteractive = Boolean(cliParams.yes || cliParams.y)
  if (!cliParams.language && !isNonInteractive) {
    const langChoice = await rl.question(`\n${colors.bright}5. Preferred Language [en/mr/hi] (default: en):${colors.reset} `)
    const normalizedLang = langChoice.trim().toLowerCase()
    if (['en', 'mr', 'hi'].includes(normalizedLang)) {
      language = normalizedLang
    }
  }

  return { name, email, role, password, language }
}

async function main() {
  const cliParams = parseArgs()

  if (cliParams.help) {
    printHelp()
    process.exit(0)
  }

  printBanner()

  const rl = readline.createInterface({ input, output })

  let dbConnected = false

  try {
    console.log(`${colors.gray}Connecting to database...${colors.reset}`)
    await connectDB()
    dbConnected = true
    console.log(`${colors.green}✓ Database connected successfully.${colors.reset}\n`)

    const userData = await promptUserInteractive(rl, cliParams)

    // Check if user already exists
    const existing = await User.findOne({ email: userData.email })
    let isUpdate = false

    if (existing) {
      console.log(`\n${colors.yellow}⚠️  A user with email "${userData.email}" already exists (Current Role: ${existing.role}, Name: ${existing.name}).${colors.reset}`)
      const overwrite = await rl.question(`Do you want to update this user's password and role to "${userData.role}"? (y/N): `)
      if (!overwrite.trim().toLowerCase().startsWith('y')) {
        console.log(`${colors.red}Aborted. No changes were made.${colors.reset}\n`)
        rl.close()
        await disconnectDB()
        process.exit(0)
      }
      isUpdate = true
    }

    // Confirmation screen if not --yes
    if (!cliParams.yes && !cliParams.y && !isUpdate) {
      console.log(`\n${colors.bright}${colors.cyan}------------------------------------------------------${colors.reset}`)
      console.log(`${colors.bright}Verify User Creation Details:${colors.reset}`)
      console.log(`  ${colors.bright}Name:${colors.reset}     ${userData.name}`)
      console.log(`  ${colors.bright}Email:${colors.reset}    ${userData.email}`)
      console.log(`  ${colors.bright}Role:${colors.reset}     ${colors.green}${userData.role.toUpperCase()}${colors.reset}`)
      console.log(`  ${colors.bright}Language:${colors.reset} ${userData.language}`)
      console.log(`  ${colors.bright}Verified:${colors.reset} Yes (Auto-verified via CLI)`)
      console.log(`${colors.bright}${colors.cyan}------------------------------------------------------${colors.reset}`)

      const confirm = await rl.question(`Create this user? (${colors.green}Y${colors.reset}/n): `)
      if (confirm.trim() && !confirm.trim().toLowerCase().startsWith('y')) {
        console.log(`${colors.red}Operation cancelled.${colors.reset}\n`)
        rl.close()
        await disconnectDB()
        process.exit(0)
      }
    }

    // Hash password & save user
    console.log(`\n${colors.gray}Encrypting password & saving to database...${colors.reset}`)
    const hashedPassword = await hashPassword(userData.password)

    let savedUser
    if (isUpdate) {
      existing.name = userData.name
      existing.role = userData.role
      existing.language = userData.language
      existing.passwordHash = hashedPassword
      existing.isVerified = true
      savedUser = await existing.save()
    } else {
      savedUser = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
        language: userData.language,
        isVerified: true,
        authProvider: 'local'
      })
    }

    // Success Output Card
    console.log(`\n${colors.green}${colors.bright}======================================================${colors.reset}`)
    console.log(`${colors.green}${colors.bright}  🎉 USER ${isUpdate ? 'UPDATED' : 'CREATED'} SUCCESSFULLY!${colors.reset}`)
    console.log(`${colors.green}${colors.bright}======================================================${colors.reset}`)
    console.log(`  ${colors.bright}User ID:${colors.reset}   ${savedUser._id}`)
    console.log(`  ${colors.bright}Name:${colors.reset}      ${savedUser.name}`)
    console.log(`  ${colors.bright}Email:${colors.reset}     ${savedUser.email}`)
    console.log(`  ${colors.bright}Role:${colors.reset}      ${colors.cyan}${savedUser.role.toUpperCase()}${colors.reset}`)
    console.log(`  ${colors.bright}Verified:${colors.reset}  ${savedUser.isVerified ? '✓ Yes' : 'No'}`)
    console.log(`  ${colors.bright}Created:${colors.reset}   ${new Date(savedUser.createdAt || Date.now()).toLocaleString()}`)
    console.log(`${colors.green}${colors.bright}======================================================${colors.reset}\n`)

    console.log(`${colors.bright}You can now log in directly at:${colors.reset}`)
    console.log(`  ${colors.cyan}Web Portal:${colors.reset} http://localhost:5173/login`)
    console.log(`  ${colors.cyan}Email:${colors.reset}      ${savedUser.email}`)
    console.log(`  ${colors.cyan}Password:${colors.reset}   (the password you entered above)\n`)

    rl.close()
  } catch (error) {
    console.error(`\n${colors.red}❌ Error creating user:${colors.reset}`, error.message)
    rl.close()
  } finally {
    if (dbConnected) {
      await disconnectDB()
    }
  }
}

main()
