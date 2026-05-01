import { createSubmission } from '@/lib/server/db';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const body = await request.json();
        const created = await createSubmission(body);
        return json(created);
    } catch (err) {
        return error(err.message || 'Failed to create submission', 500);
    }
}
