import 'server-only';

import { NextResponse } from 'next/server';

import { getAuthUser, rateLimit } from './db';

export function json(data, init) {
    return NextResponse.json(data, init);
}

export function error(message, status = 400) {
    return json({ error: message }, { status });
}

export function getRequestIp(request) {
    return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

export function applyRateLimit(request) {
    return rateLimit(getRequestIp(request));
}

export async function requireUser(request) {
    const user = await getAuthUser(request);
    if (!user) return { error: error('Unauthorized', 401) };
    return { user };
}

export async function requireAdmin(request) {
    const result = await requireUser(request);
    if (result.error) return result;
    if (result.user.role !== 'admin' && result.user.role !== 'editor') {
        return { error: error('Admin access required', 403) };
    }
    return result;
}
