"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL is not set in environment variables");
}
const redis = new ioredis_1.default(redisUrl + "?family=0");
redis.on("connect", () => {
    console.log("✅ Redis connected!");
});
redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
});
exports.default = redis;
