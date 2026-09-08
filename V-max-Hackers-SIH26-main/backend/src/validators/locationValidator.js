import Joi from "joi";


const locationSchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required(),


    city: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required(),


    state: Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional(),


    country: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),


    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({

            "number.min":
                "Latitude must be between -90 and 90",

            "number.max":
                "Latitude must be between -90 and 90"
        }),


    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({

            "number.min":
                "Longitude must be between -180 and 180",

            "number.max":
                "Longitude must be between -180 and 180"
        }),


    isFavorite: Joi.boolean()
        .default(false)
});


const updateLocationSchema =
    Joi.object({

        name: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .optional(),

        city: Joi.string()
            .trim()
            .max(100)
            .optional(),

        state: Joi.string()
            .trim()
            .max(100)
            .allow("")
            .optional(),

        country: Joi.string()
            .trim()
            .max(100)
            .optional(),

        latitude: Joi.number()
            .min(-90)
            .max(90)
            .optional(),

        longitude: Joi.number()
            .min(-180)
            .max(180)
            .optional(),

        isFavorite: Joi.boolean()
            .optional()
    })
    .min(1);


export {
    locationSchema,
    updateLocationSchema
};