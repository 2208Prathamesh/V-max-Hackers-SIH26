import Joi from 'joi'

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  profileImage: Joi.string().allow(null, '').optional(),
  language: Joi.string().max(10).optional(),
  timezone: Joi.string().max(50).optional()
}).min(1)

export { updateUserSchema }
export default { updateUserSchema }