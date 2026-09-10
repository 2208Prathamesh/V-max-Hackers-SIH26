import jwt from 'jsonwebtoken'
import env from '../config/env.js'

const generateToken = userId => {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    {
      userId: userId.toString()
    },
    secret,
    {
      expiresIn: env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '7d'
    }
  )
}

export default generateToken
