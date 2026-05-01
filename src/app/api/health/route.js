import { json, error, applyRateLimit } from '@/lib/server/api';
import { getHealth } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);
    try {
        return json(await getHealth());
    } catch (err) {
        return error(err.message || 'Health check failed', 500);
    }
}
