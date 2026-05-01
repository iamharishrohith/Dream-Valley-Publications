import { getBooks, getAuthUser } from '@/lib/server/db';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const { searchParams } = new URL(request.url);
        const actor = await getAuthUser(request);
        const books = await getBooks({
            actor,
            status: searchParams.get('status') || undefined,
            type: searchParams.get('type') || undefined,
            category: searchParams.get('category') || undefined,
            search: searchParams.get('search') || undefined,
        });
        return json(books);
    } catch (err) {
        return error(err.message || 'Failed to load books', 500);
    }
}
