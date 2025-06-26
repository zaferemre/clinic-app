"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrSetCache = getOrSetCache;
exports.invalidateCache = invalidateCache;
// src/utils/cacheHelpers.ts
const redisClient_1 = __importDefault(require("./redisClient"));
// Cache for 1 minute by default
const DEFAULT_TTL = 60; // seconds
async function getOrSetCache(key, fetchFn, ttl = DEFAULT_TTL) {
    const cached = await redisClient_1.default.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    const fresh = await fetchFn();
    await redisClient_1.default.set(key, JSON.stringify(fresh), "EX", ttl);
    return fresh;
}
async function invalidateCache(key) {
    await redisClient_1.default.del(key);
}
