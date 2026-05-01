import { signAuthToken } from '@/lib/server/auth';
import { authenticateUser, recordAudit } from '@/lib/server/db';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const body = await request.json();
        const user = await authenticateUser(body.email, body.password);
        if (!user) return error('Invalid credentials', 401);

        const token = await signAuthToken(user);
        await recordAudit(user.email, 'auth.login', user.id);

        return json({ token, user, provider: 'jwt' });
    } catch (err) {
        return error(err.message || 'Login failed', 500);
    }
}
