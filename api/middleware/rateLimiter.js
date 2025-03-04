require('dotenv').config()
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const RATE_LIMIT_CONFIGS = {
    notifications: {
        points: 100,      // Number of requests
        duration: 3600,   // Per hour
        blockDuration: 600 // Block for 10 minutes if exceeded
    },
    default: {
        points: 1000,     // Number of requests
        duration: 3600,   // Per hour
        blockDuration: 300 // Block for 5 minutes if exceeded
    }
};

exports.rateLimiter = (type = 'default') => {
    const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.default;

    return async (req, res, next) => {
        const key = `ratelimit:${type}:${req.ip}`;

        try {
            // Get current count
            const current = await redis.get(key);

            if (current !== null) {
                if (parseInt(current) >= config.points) {
                    return res.status(429).json({
                        message: 'Too many requests',
                        retryAfter: config.blockDuration
                    });
                }

                await redis.incr(key);
            } else {
                await redis.setex(key, config.duration, 1);
            }

            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': config.points,
                'X-RateLimit-Remaining': current ? config.points - parseInt(current) - 1 : config.points - 1,
                'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + config.duration
            });

            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            // If Redis is down, allow the request but log the error
            next();
        }
    };
}; 