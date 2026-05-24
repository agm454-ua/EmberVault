import { check, sleep } from 'k6';
import { getLoadOptions } from '../options.js';
import { getAuthToken } from '../helpers/auth.js';
import { get } from '../helpers/http.js';

const BASE_URL = __ENV.BASE_URL || 'https://embervault.local';
const MEDIA_BASE_URL = __ENV.MEDIA_BASE_URL || `${BASE_URL}/media/api`;
const EMAIL = __ENV.TEST_EMAIL;
const PASSWORD = __ENV.TEST_PASSWORD;

export const options = getLoadOptions();

export function setup() {
    const token = getAuthToken(EMAIL, PASSWORD);
    if (!token) {
        throw new Error('Missing auth token for media load test');
    }
    return { token };
}

export default function (data) {
    const token = data.token;

    const fileCountRes = get(`${MEDIA_BASE_URL}/stats/files/count`, token);
    check(fileCountRes, { 'file count: status is 200': (r) => r.status === 200 });

    const storageRes = get(`${MEDIA_BASE_URL}/stats/storage-used`, token);
    check(storageRes, { 'storage used: status is 200': (r) => r.status === 200 });

    const listFilesRes = get(`${MEDIA_BASE_URL}/stats/files`, token);
    check(listFilesRes, { 'list files: status is 200': (r) => r.status === 200 });

    sleep(1);
}