import { createClient } from "redis";
import Logger from "../utils/Logger";
import { promisify } from "util";

// const RedisClient = createClient({
// 	host: process.env.REDIS_HOST,
// 	password: process.env.REDIS_PASSWORD,
// 	retry_strategy: function(options) {
// 		if (options.error && options.error.code === "ECONNREFUSED") {
// 			// End reconnecting on a specific error and flush all commands with
// 			// a individual error
// 			return new Error("The server refused the connection");
// 		}
// 		if (options.total_retry_time > (1000 * 60 * 60)) {
// 			// End reconnecting after a specific timeout and flush all commands
// 			// with a individual error
// 			return new Error("Retry time exhausted");
// 		}
// 		if (options.attempt > 10) {
// 			// End reconnecting with built in error
// 			return undefined;
// 		}
// 		// reconnect after
// 		Logger.warn(
// 			`[RedisClient] Reconnect attempt: ${options.attempt}.
// 			Total retry time: ${options.total_retry_time}ms.`
// 		);
// 		return Math.min(options.attempt * 100, 3000);
// 	},
// });
//
// export const getRedisAsync = promisify(RedisClient.get).bind(RedisClient);
// export const setRedisAsync = promisify(RedisClient.set).bind(RedisClient);

// Not using Redis for pricing reasons. Impacts: https://cloud.google.com/run/docs/tips/general

const cache: Record<string, any> = {};

export const getRedisAsync = async function(key: string) {
	return cache[key];
};

export const setRedisAsync = async function(key: string, data: any) {
	cache[key] = data;
};
