const apiBase = process.env.SMOKE_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const adminEmail = process.env.FLOW_ADMIN_EMAIL || 'editor@example.com';
const adminPassword = process.env.FLOW_ADMIN_PASSWORD || 'Password123';

const unique = Date.now();
const authorEmail = `author-${unique}@example.com`;
const password = 'AuthorPass1';

const postJson = async (path, body, token) => {
    const response = await fetch(`${apiBase}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`${path} -> ${response.status} ${JSON.stringify(data)}`);
    }
    return data;
};

const getJson = async (path, token) => {
    const response = await fetch(`${apiBase}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`${path} -> ${response.status} ${JSON.stringify(data)}`);
    }
    return data;
};

console.log(`Using API base: ${apiBase}`);

const registration = await postJson('/api/auth/register', {
    name: 'Flow Check Author',
    email: authorEmail,
    password,
});
console.log(`PASS register: ${registration.user.email}`);

const login = await postJson('/api/auth/login', {
    email: authorEmail,
    password,
});
console.log(`PASS login: ${login.user.email}`);

await postJson('/api/contact', {
    name: 'Flow Check Lead',
    email: authorEmail,
    lane: 'author',
    subject: 'Flow verification',
    message: 'Testing contact lead creation through automated flow verification.',
});
console.log('PASS contact lead');

await postJson('/api/newsletter', {
    email: authorEmail,
    interest: 'Author publishing',
});
console.log('PASS newsletter subscribe');

const submission = await postJson('/api/submissions', {
    title: `Flow Verification Manuscript ${unique}`,
    author: 'Flow Check Author',
    email: authorEmail,
    ownerEmail: authorEmail,
    whatsapp: '+91 9000000000',
    phone: '+91 9000000001',
    institution: 'Flow Check Institute',
    lane: 'author',
    serviceTier: 'guided',
    timeline: 'Flexible',
    region: 'India',
    description: 'Automated verification submission used to confirm author ownership and admin visibility.',
    type: 'book',
});
console.log(`PASS submission create: ${submission.id}`);

const owned = await getJson('/api/auth/submissions', login.token);
if (!Array.isArray(owned) || !owned.some((item) => item.id === submission.id)) {
    throw new Error('Owned submissions endpoint did not return the new submission');
}
console.log('PASS author dashboard submissions');

const admin = await postJson('/api/auth/login', {
    email: adminEmail,
    password: adminPassword,
});
console.log(`PASS admin login: ${admin.user.email}`);

const adminSubmissions = await getJson('/api/admin/submissions', admin.token);
if (!Array.isArray(adminSubmissions) || !adminSubmissions.some((item) => item.id === submission.id)) {
    throw new Error('Admin submissions endpoint did not return the created submission');
}
console.log('PASS admin submissions visibility');

const metrics = await getJson('/api/admin/metrics', admin.token);
if (typeof metrics.pending !== 'number') {
    throw new Error('Admin metrics payload is missing expected counters');
}
console.log('PASS admin metrics');

const audit = await getJson('/api/admin/audit', admin.token);
if (!Array.isArray(audit) || audit.length === 0) {
    throw new Error('Admin audit payload was empty');
}
console.log('PASS admin audit');

console.log('\nFlow verification passed.');
