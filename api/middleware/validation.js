const Joi = require('joi');

const schemas = {
    createBooking: Joi.object({
        customer: Joi.string().required(),
        requested_by: Joi.string().required(),
        service: Joi.string().required(),
        organisation: Joi.string().required(),
        schedule: Joi.object({
            requestedDate: Joi.date().required(),
            duration: Joi.number()
        }).required(),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2),
            address: Joi.string()
        }),
        payment: Joi.object({
            method: Joi.string().required(),
            amount: Joi.number().required()
        })
    }),

    createChat: Joi.object({
        type: Joi.string().required(),
        participants: Joi.array().items(
            Joi.object({
                user: Joi.string().required(),
                role: Joi.string()
            })
        ).min(2).required(),
        booking: Joi.string(),
        settings: Joi.object({
            isPrivate: Joi.boolean(),
            allowMedia: Joi.boolean()
        })
    }),

    sendMessage: Joi.object({
        content: Joi.string().required(),
        messageType: Joi.string().default('text'),
        media: Joi.array().items(
            Joi.object({
                type: Joi.string().required(),
                url: Joi.string().required()
            })
        ),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2),
            address: Joi.string()
        })
    }),

    generateAnalytics: Joi.object({
        provider: Joi.string().required(),
        timeframe: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
        date: Joi.date().required()
    }),

    createNotification: Joi.object({
        recipient: Joi.string().required(),
        type: Joi.string().required(),
        title: Joi.string().required(),
        message: Joi.string().required(),
        priority: Joi.string().valid('low', 'normal', 'high'),
        data: Joi.object(),
        deliveryChannels: Joi.array().items(
            Joi.object({
                type: Joi.string().valid('email', 'sms', 'push', 'in_app').required()
            })
        ),
        scheduledFor: Joi.date(),
        expiresAt: Joi.date()
    }),

    updatePreferences: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        sms: Joi.boolean(),
        types: Joi.object().pattern(
            Joi.string(),
            Joi.array().items(Joi.string().valid('email', 'push', 'sms', 'in_app'))
        )
    })
};

exports.validateRequest = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({ message: `Schema ${schemaName} not found` });
        }

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({ message: 'Validation error', errors });
        }

        next();
    };
}; 