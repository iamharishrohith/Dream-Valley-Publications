import { getMySubmissions } from '@/lib/server/db';
import { json, error, applyRateLimit, requireUser } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);
    const result = await requireUser(request);
    if (result.error) return result.error;
    return json(await getMySubmissions(result.user.email));
}
