"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrSetCache = getOrSetCache;
exports.setCache = setCache;
exports.invalidateCache = invalidateCache;
const cacheClient_1 = __importDefault(require("./cacheClient"));
const DEFAULT_TTL = 60; // seconds
async function getOrSetCache(key, fetchFn, ttl = DEFAULT_TTL) {
    const cached = await cacheClient_1.default.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    const fresh = await fetchFn();
    await cacheClient_1.default.set(key, JSON.stringify(fresh), "EX", ttl);
    return fresh;
}
async function setCache(key, value, ttl = DEFAULT_TTL) {
    await cacheClient_1.default.set(key, JSON.stringify(value), "EX", ttl);
}
async function invalidateCache(key) {
    await cacheClient_1.default.del(key);
}
