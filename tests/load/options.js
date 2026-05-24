


export const normalLoad = {
    insecureSkipTLSVerify: true, thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_waiting: ['p(95)<400'],
        http_req_failed: ['rate<0.01'],
    },
    stages: [
        { duration: '30s', target: 100 },    // Ramp up to 100 VUs
        { duration: '1m', target: 100 },     // Stay at 100
        { duration: '15s', target: 0 },     // Ramp down
    ],
};

export const peakLoad = {
    insecureSkipTLSVerify: true,
    thresholds: {
        http_req_duration: ['p(95)<1500'],
        http_req_waiting: ['p(95)<1500'],
        http_req_failed: ['rate<0.05'],
    },
    stages: [
        { duration: '10s', target: 50 },    // Warm up
        { duration: '30s', target: 300 },   // Spike to 300 VUs
        { duration: '20s', target: 300 },   // Hold briefly
        { duration: '10s', target: 0 },     // Drop immediately
    ],
};

export const sustainedLoad = {
    insecureSkipTLSVerify: true,
    thresholds: {
        http_req_duration: ['p(99)<1000'],
        http_req_waiting: ['p(95)<400'],
        http_req_failed: ['rate<0.01'],
    },
    stages: [
        { duration: '1m', target: 50 },     // Ramp up
        { duration: '5m', target: 50 },     // Hold for 5 minutes
        { duration: '1m', target: 0 },      // Ramp down
    ],
};

const loadProfiles = {
    normal: normalLoad,
    peak: peakLoad,
    sustained: sustainedLoad,
};

export function getLoadOptions() {
    const profile = (__ENV.LOAD_PROFILE || 'normal').toLowerCase();
    return loadProfiles[profile] ?? normalLoad;
}