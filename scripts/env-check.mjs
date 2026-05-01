import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const parseEnvFile = (filePath) => {
    if (!existsSync(filePath)) return {};
    return Object.fromEntries(
        readFileSync(filePath, 'utf8')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#') && line.includes('='))
            .map((line) => {
                const index = line.indexOf('=');
                return [line.slice(0, index), line.slice(index + 1)];
            }),
    );
};

const rootEnv = parseEnvFile(resolve('.env.local'));
const serverEnv = parseEnvFile(resolve('server/.env'));

const rootRequired = ['NEXT_PUBLIC_API_URL'];
const serverRequired = ['DATABASE_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];
const optionalServer = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
];

const missingRoot = rootRequired.filter((key) => !(rootEnv[key] || process.env[key]));
const missingServer = serverRequired.filter((key) => !(serverEnv[key] || process.env[key]));
const configuredOptional = optionalServer.filter((key) => !!(serverEnv[key] || process.env[key]));

console.log('Environment verification');
console.log(`- Root required: ${rootRequired.join(', ')}`);
console.log(`- Server required: ${serverRequired.join(', ')}`);

if (missingRoot.length > 0) console.error(`Missing root env vars: ${missingRoot.join(', ')}`);
if (missingServer.length > 0) console.error(`Missing server env vars: ${missingServer.join(', ')}`);

console.log(`Configured optional integrations: ${configuredOptional.length > 0 ? configuredOptional.join(', ') : 'none'}`);

if (missingRoot.length > 0 || missingServer.length > 0) {
    process.exit(1);
}

console.log('Environment verification passed.');
