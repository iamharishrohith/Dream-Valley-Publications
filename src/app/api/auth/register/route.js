import { signAuthToken } from '@/lib/server/auth';
import { registerUser, isStrongPassword, recordAudit } from '@/lib/server/db';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const body = await request.json();
        if (!isStrongPassword(body.password || '')) {
            return error('Password must be at least 8 characters and include uppercase, lowercase, and a number', 400);
        }

        const user = await registerUser(body.name, body.email, body.password);
        const token = await signAuthToken(user);
        await recordAudit(user.email, 'auth.register', user.id);

        return json({ token, user, provider: 'jwt' });
    } catch (err) {
        if (err.message.includes('already exists')) return error(err.message, 409);
        return error(err.message || 'Registration failed', 500);
    }
}
