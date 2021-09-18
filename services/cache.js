const NodeCache = require("node-cache");
const {createClient} = require("redis");

module.exports = class Cache {
    constructor(ttl) {
        this.ttl = ttl;
        this.redis = null;

        if (process.env["REDIS_URI"]) {
            this._createRedisClient(process.env["REDIS_URI"])
        } else {
            this.nodeCache = new NodeCache({stdTTL: ttl})
        }
    }

    async _createRedisClient(url) {
        this.redis = createClient({
            socket: {
                url: url
            }
        });

        this.redis.on("error", (err) => console.error("REDIS ERROR:", err));

        await this.redis.connect();

        console.log("REDIS:", "Connected");
    }

    _checkIfJsonStr(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    async get(key) {
        if(this.nodeCache) return this.nodeCache.get(key);

        let data = await this.redis.get(key);

        if(this._checkIfJsonStr(data)) return JSON.parse(data);

        return data;
    }

    async set(key, value) {
        if(this.nodeCache) return this.nodeCache.set(key, value);

        if(typeof(value) === "object") value = JSON.stringify(value);

        await this.redis.set(key, value);
        await this.redis.expire(key, this.ttl);
    }

    async has(key) {
        if(this.nodeCache) return this.nodeCache.has(key);

        return await this.redis.exists(key);
    }
}