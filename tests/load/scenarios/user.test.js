import { check, sleep } from 'k6';
import { getLoadOptions } from '../options.js';
import { getAuthToken } from '../helpers/auth.js';
import { get } from '../helpers/http.js';

const BASE_URL = __ENV.BASE_URL || 'https://embervault.local';
const USER_BASE_URL = __ENV.USER_BASE_URL || `${BASE_URL}/user/api`;
const EMAIL = __ENV.TEST_EMAIL;
const PASSWORD = __ENV.TEST_PASSWORD;

export const options = getLoadOptions();

export function setup() {
    const token = getAuthToken(EMAIL, PASSWORD);
    if (!token) {
        throw new Error('Missing auth token for user load test');
    }
    return { token };
}

export default function (data) {
    const token = data.token;

    const countRes = get(`${USER_BASE_URL}/users/count`, token);
    check(countRes, { 'user count: status is 200': (r) => r.status === 200 });

    const lastWeekRes = get(`${USER_BASE_URL}/users/added-last-week`, token);
    check(lastWeekRes, { 'users last week: status is 200': (r) => r.status === 200 });

    const allUsersRes = get(`${USER_BASE_URL}/users/all?take=20`, token);
    check(allUsersRes, { 'all users: status is 200': (r) => r.status === 200 });

    sleep(1);
}