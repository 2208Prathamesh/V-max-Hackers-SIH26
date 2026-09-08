import Joi from "joi";


const sendMessageSchema = Joi.object({

    conversationId: Joi.string()
        .required()
        .messages({

            "any.required":
                "Conversation ID is required"
        }),


    content: Joi.string()
        .trim()
        .min(1)
        .max(5000)
        .required()
        .messages({

            "string.empty":
                "Message cannot be empty",

            "string.max":
                "Message cannot exceed 5000 characters",

            "any.required":
                "Message content is required"
        }),


    messageType: Joi.string()
        .valid(
            "text",
            "weather",
            "forecast",
            "alert"
        )
        .default("text")
});


const createConversationSchema = Joi.object({

    title: Joi.string()
        .trim()
        .max(100)
        .optional(),

    category: Joi.string()
        .valid(
            "weather",
            "forecast",
            "alert",
            "climate",
            "general"
        )
        .default("general")
});


const renameConversationSchema = Joi.object({

    title: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
});


export {
    sendMessageSchema,
    createConversationSchema,
    renameConversationSchema
};