import { createContactLead } from '@/lib/server/db';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const body = await request.json();
        return json(await createContactLead(body));
    } catch (err) {
        return error(err.message || 'Failed to create contact lead', 500);
    }
}
