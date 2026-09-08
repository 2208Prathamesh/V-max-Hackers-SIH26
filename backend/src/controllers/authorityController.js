import { successResponse } from '../utils/response.js'

/**
 * Get current authenticated authority user
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware
    const user = req.user;

    return successResponse(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, 'Authority authenticated', 200);
  } catch (error) {
    next(error);
  }
}

export {
  getMe
}

export default {
  getMe
}
