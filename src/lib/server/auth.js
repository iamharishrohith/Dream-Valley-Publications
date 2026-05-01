import 'server-only';

import { jwtVerify, SignJWT } from 'jose';

const secretValue = process.env.JWT_SECRET || 'dev-insecure-secret';
const secret = new TextEncoder().encode(secretValue);

export async function signAuthToken(user) {
    return new SignJWT({
        id: user.id,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret);
}

export async function verifyAuthToken(token) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export function getBearerToken(request) {
    const header = request.headers.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return null;
    return header.slice(7);
}
