import User from '../models/User.js'
import { hashPassword } from '../utils/password.js'

const DEMO_USERS = [
  {
    name: 'Citizen User',
    email: 'citizen@weathergpt.ai',
    password: 'password123',
    role: 'user',
    language: 'en'
  },
  {
    name: 'Ramesh Kisan (शेतकरी)',
    email: 'farmer@weathergpt.ai',
    password: 'password123',
    role: 'farmer',
    language: 'en'
  },
  {
    name: 'Dr. A. Sharma (Disaster Cell)',
    email: 'authority@weathergpt.ai',
    password: 'password123',
    role: 'authority',
    language: 'en'
  },
  {
    name: 'System Administrator',
    email: 'admin@weathergpt.ai',
    password: 'password123',
    role: 'admin',
    language: 'en'
  }
]

export const seedDefaultRolesUsers = async () => {
  try {
    const passwordHash = await hashPassword('password123')

    for (const demo of DEMO_USERS) {
      const existing = await User.findOne({ email: demo.email })
      if (!existing) {
        await User.create({
          name: demo.name,
          email: demo.email,
          passwordHash,
          role: demo.role,
          language: demo.language,
          isVerified: true
        })
        console.log(`👤 Seeded demo user: [${demo.role.toUpperCase()}] ${demo.email}`)
      } else {
        existing.passwordHash = passwordHash
        existing.role = demo.role
        existing.isVerified = true
        await existing.save()
        console.log(`👤 Synced demo user credentials: [${demo.role.toUpperCase()}] ${demo.email}`)
      }
    }
  } catch (err) {
    console.warn('⚠️ [seedDefaultRolesUsers] Error initializing demo role users:', err.message)
  }
}

export default seedDefaultRolesUsers
