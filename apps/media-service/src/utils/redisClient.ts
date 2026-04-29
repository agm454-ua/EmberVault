import { createClient } from 'redis';
import { ENV } from '@config/env.js';

const client = createClient({
    url: ENV.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

export const connectRedis = async () => {
    if (!client.isOpen) await client.connect();
};

export default client;