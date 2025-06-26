import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not set in environment variables");
}

const redis = new Redis(redisUrl + "?family=0");

redis.on("connect", () => {
  console.log("✅ Redis connected!");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
