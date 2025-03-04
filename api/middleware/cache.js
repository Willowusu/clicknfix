require('dotenv').config()
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

exports.cacheResponse = (duration = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cached = await redis.get(key);

            if (cached) {
                const parsedCache = JSON.parse(cached);
                return res.status(200).json(parsedCache);
            }

            // Store original send function
            const sendResponse = res.json;

            // Override response method
            res.json = function (body) {
                // Store the response in cache
                redis.setex(key, duration, JSON.stringify(body))
                    .catch(err => console.error('Cache storage error:', err));

                // Send the actual response
                return sendResponse.call(this, body);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
}; 