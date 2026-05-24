import http from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'https://embervault.local';

export function getAuthToken(email, password) {
    const res = http.post(
        `${BASE_URL}/auth/api/login`,
        JSON.stringify({ email, password }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    if (res.status !== 200) {
        throw new Error(`Login failed: ${res.status} ${res.body}`);
    }

    const payload = JSON.parse(res.body);
    const token = payload.data.token;
    return token;
}