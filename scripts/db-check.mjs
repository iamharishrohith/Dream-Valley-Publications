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

const serverEnv = parseEnvFile(resolve('server/.env'));
const databaseUrl = process.env.DATABASE_URL || serverEnv.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is required for db verification.');
    process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

const result = await Bun.sql`select current_database() as database_name, now() as checked_at`;
console.log(`Database check passed for ${result[0].database_name}`);
console.log(`Checked at ${result[0].checked_at}`);
