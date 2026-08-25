import Joi from "joi";


const updateUserSchema = Joi.object({

    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .optional(),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .optional(),

    profileImage: Joi.string()
        .uri()
        .optional()
});


export {
    updateUserSchema
};