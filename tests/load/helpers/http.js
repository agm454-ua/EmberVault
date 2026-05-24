import http from 'k6/http';

const defaultHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
});

export function get(url, token) {
    return http.get(url, {
        headers: defaultHeaders(token),
    });
}

export function post(url, body, token) {
    return http.post(url, JSON.stringify(body), {
        headers: defaultHeaders(token),
    });
}

export function del(url, token) {
    return http.del(url, null, {
        headers: defaultHeaders(token),
    });
}