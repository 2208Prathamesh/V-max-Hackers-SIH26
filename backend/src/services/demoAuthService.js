import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import User from '../models/User.js'

export const DEMO_PERSONAS = {
  citizen: {
    id: 'demo-citizen-01',
    _id: 'demo-citizen-01',
    name: 'Priya Sharma (Citizen)',
    email: 'citizen@weathergpt.ai',
    role: 'user',
    language: 'en',
    isVerified: true,
    isDemo: true,
    location: 'Pune, Maharashtra'
  },
  farmer: {
    id: 'demo-farmer-02',
    _id: 'demo-farmer-02',
    name: 'Ramesh Kisan (शेतकरी)',
    email: 'farmer@weathergpt.ai',
    role: 'farmer',
    language: 'mr',
    isVerified: true,
    isDemo: true,
    location: 'Nashik, Maharashtra'
  },
  authority: {
    id: 'demo-authority-03',
    _id: 'demo-authority-03',
    name: 'Dr. A. Sharma (Disaster Cell)',
    email: 'authority@weathergpt.ai',
    role: 'authority',
    language: 'en',
    isVerified: true,
    isDemo: true,
    location: 'State EOC Mumbai, Maharashtra'
  },
  admin: {
    id: 'demo-admin-04',
    _id: 'demo-admin-04',
    name: 'System Administrator',
    email: 'admin@weathergpt.ai',
    role: 'admin',
    language: 'en',
    isVerified: true,
    isDemo: true,
    location: 'Central Command'
  }
}

/**
 * Resolves a demo user by ID or Role
 */
export const getDemoUser = (userId, role) => {
  const strId = String(userId || '')
  for (const key of Object.keys(DEMO_PERSONAS)) {
    const p = DEMO_PERSONAS[key]
    if (p.id === strId || p._id === strId) return p
  }
  if (role && DEMO_PERSONAS[role]) return DEMO_PERSONAS[role]
  return DEMO_PERSONAS.citizen
}

/**
 * Executes a deterministic, isolated Demo Login for hackathon judging
 */
export const executeDemoLogin = async (personaKey = 'citizen') => {
  const key = String(personaKey).toLowerCase().trim()
  const persona = DEMO_PERSONAS[key] || DEMO_PERSONAS.citizen

  // Check if user exists in database or create if DB is connected
  let dbUser = null
  try {
    if (User.db?.readyState === 1) {
      dbUser = await User.findOne({ email: persona.email })
      if (!dbUser) {
        dbUser = await User.create({
          name: persona.name,
          email: persona.email,
          role: persona.role,
          language: persona.language,
          isVerified: true,
          passwordHash: 'DEMO_ACCOUNT_NO_PASSWORD'
        }).catch(() => null)
      }
    }
  } catch (err) {
    // Database error - continue gracefully with in-memory demo user
    console.warn('⚠️ [DemoAuth] DB lookup skipped (running demo fallback):', err.message)
  }

  const userId = dbUser?._id ? dbUser._id.toString() : persona.id
  const secret = env.JWT_SECRET || process.env.JWT_SECRET || 'weathergpt-prototype-secret-key-2026'

  const token = jwt.sign(
    {
      userId,
      role: persona.role,
      isDemo: true,
      persona: key
    },
    secret,
    { expiresIn: '7d' }
  )

  return {
    user: {
      id: userId,
      _id: userId,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      language: persona.language,
      isDemo: true,
      location: persona.location
    },
    token
  }
}
