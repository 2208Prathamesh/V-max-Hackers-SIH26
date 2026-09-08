import Joi from "joi";


const registerSchema = Joi.object({

    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            "string.min":
                "Name must contain at least 2 characters",

            "string.max":
                "Name cannot exceed 50 characters",

            "any.required":
                "Name is required"
        }),


    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            "string.email":
                "Please provide a valid email",

            "any.required":
                "Email is required"
        }),


    password: Joi.string()
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.min":
                "Password must contain at least 8 characters",

            "any.required":
                "Password is required"
        })
});


const loginSchema = Joi.object({

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    password: Joi.string()
        .required()
});


const forgotPasswordSchema = Joi.object({

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
});


const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .max(100)
        .required()
});


const changePasswordSchema = Joi.object({

    currentPassword: Joi.string()
        .required(),

    newPassword: Joi.string()
        .min(8)
        .max(100)
        .required()
});


export {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
};
