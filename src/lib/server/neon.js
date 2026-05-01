import 'server-only';

import { neon } from '@neondatabase/serverless';

let neonClient = null;

export function getSql() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not configured');
    }

    if (!neonClient) {
        neonClient = neon(process.env.DATABASE_URL);
    }

    return neonClient;
}
