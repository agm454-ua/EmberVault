import redis from './redisClient.js';

const DEFAULT_TTL = 60 * 5; // 5 minutes

export async function cached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL
): Promise<T> {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;

    const data = await fetcher();

    if (data !== null && data !== undefined) {
        await redis.setEx(key, ttl, JSON.stringify(data));
    }

    return data;
}

export async function invalidate(...keys: string[]) {
    if (keys.length > 0) await redis.del(keys);
}

// Invalidate all keys matching a pattern e.g. "user:*"
export async function invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(keys);
}