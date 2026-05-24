import { check, sleep } from 'k6';
import { get } from '../helpers/http.js';
import { getLoadOptions } from '../options.js';
import { getAuthToken } from '../helpers/auth.js';

const BASE_URL = __ENV.BASE_URL || 'https://embervault.local';
const AUTH_BASE_URL = __ENV.AUTH_BASE_URL || `${BASE_URL}/auth/api`;
const EMAIL = __ENV.TEST_EMAIL;
const PASSWORD = __ENV.TEST_PASSWORD;

export const options = getLoadOptions();

export function setup() {
    const token = getAuthToken(EMAIL, PASSWORD);
    if (!token) {
        throw new Error('Missing auth token for media load test');
    }
    
    const user = get(`${AUTH_BASE_URL}/me`, token);
    const payload = JSON.parse(user.body)
    const rootFolder = payload.data.root_folder

    return { token, rootFolder };
}


export default function (data) {
    const token = data.token;
    const rootFolder = data.rootFolder;

    const meRes = get(`${AUTH_BASE_URL}/me`, token);
    check(meRes, { 'me: status is 200': (r) => r.status === 200 });

    const rolesRes = get(`${AUTH_BASE_URL}/resource/roles`, token);
    check(rolesRes, { 'roles: status is 200': (r) => r.status === 200 });

    const permissionsOnRootFolderRes = get(`${AUTH_BASE_URL}/resource/${rootFolder}/roles`, token);
    check(permissionsOnRootFolderRes, { 'permissions on root folder: status is 200': (r) => r.status === 200 });

    sleep(1);
}
