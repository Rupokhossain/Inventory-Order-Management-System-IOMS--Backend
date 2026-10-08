import { createClient } from "redis";
import config from "../config";

export const redisClient = createClient({
	username: config.redis_user,
	password: config.redis_password,
	socket: {
		host: config.redis_host,
		port: Number(config.redis_port),
		keepAlive: 10000,
		reconnectStrategy: (retries: number) => {
			return Math.min(retries * 200, 3000);
		},
	},
});

// Prevent unhandled error events from crashing the Node.js process on socket reset
redisClient.on("error", (err) => {
	console.warn("⚠️ Redis client warning (auto-reconnecting):", err?.message || err);
});

redisClient.on("reconnecting", () => {
	console.log("🔄 Redis client reconnecting to remote server...");
});

redisClient.on("ready", () => {
	console.log("✅ Redis client connection ready.");
});

