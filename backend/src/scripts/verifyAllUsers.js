import mongoose from 'mongoose'
import User from '../models/User.js'
import env from '../config/env.js'

async function run() {
  try {
    await mongoose.connect(env.MONGO_URI)
    const result = await User.updateMany({}, { $set: { isVerified: true } })
    console.log(`Successfully verified ${result.modifiedCount} existing user accounts.`)
  } catch (err) {
    console.error('Error updating users:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

run()
