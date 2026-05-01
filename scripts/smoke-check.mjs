const webBase = process.env.SMOKE_WEB_BASE || 'http://localhost:3000';
const apiBase = process.env.SMOKE_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const checks = [
    { label: 'Homepage', url: `${webBase}/` },
    { label: 'Services page', url: `${webBase}/services` },
    { label: 'Resources page', url: `${webBase}/resources` },
    { label: 'API health', url: `${apiBase}/api/health` },
];

const failures = [];

for (const check of checks) {
    try {
        const response = await fetch(check.url);
        if (!response.ok) {
            failures.push(`${check.label} returned ${response.status}`);
            continue;
        }

        if (check.label === 'API health') {
            const data = await response.json();
            if (data.status !== 'ok') {
                failures.push(`API health payload was not ok: ${JSON.stringify(data)}`);
            }
        }

        console.log(`PASS ${check.label}: ${check.url}`);
    } catch (error) {
        failures.push(`${check.label} failed: ${error.message}`);
    }
}

if (failures.length > 0) {
    console.error('\nSmoke check failed:');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exit(1);
}

console.log('\nSmoke check passed.');
