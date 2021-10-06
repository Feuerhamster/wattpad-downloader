const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const Redis = require("ioredis");

class RateLimiter {
    static limiter = null;
    static points = parseInt(process.env["RATE_LIMIT_POINTS"] || 5);
    static duration = parseInt(process.env["RATE_LIMIT_DURATION"] || 86400);

    static init() {
        if (process.env["REDIS_URI"]) {
            RateLimiter._createClient(process.env["REDIS_URI"]);
        } else {
            RateLimiter.limiter = new RateLimiterMemory({
                points: RateLimiter.points, duration: RateLimiter.duration
            });
        }
    }

    static async _createClient(url) {
        let redis = new Redis(url)

        redis.on("error", (err) => console.error("REDIS [RATE_LIMITER] ERROR:", err));
        redis.on("connect", () => console.log("REDIS [RATE_LIMITER]: Connected"));

        RateLimiter.limiter = new RateLimiterRedis({
            points: RateLimiter.points,
            duration: RateLimiter.duration,
            storeClient: redis,
            keyPrefix: "wpdl-ratelimit"
        });
    }

    static async consume(ip) {
        try {
            await RateLimiter.limiter.consume(ip);
        } catch (e) {
            if (e instanceof Error) {
                console.log("RATE LIMITER ERROR:", e.message);
            } else {
                return false;
            }
        }

        return true;
    }

    static async get(ip) {
        let limits = {
            remaining: RateLimiter.points,
            total: RateLimiter.points
        }

        let res = await this.limiter.get(ip);

        if(res) limits.remaining = res._remainingPoints;

        if(isNaN(limits.remaining)) limits.remaining = limits.total;

        return limits;
    }
}

module.exports = RateLimiter;