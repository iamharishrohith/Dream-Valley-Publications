import 'server-only';

import { randomUUID } from 'node:crypto';
import { hash, compare } from 'bcryptjs';

import { getSql } from './neon';
import { getBearerToken, verifyAuthToken } from './auth';

let initPromise = null;

const baseBookSelect = `
  SELECT id, title, author, owner_email, email, whatsapp, phone, institution, lane, service_tier, timeline, region,
         isbn, cover, cover_thumb, cover_blur, cover_public_id, document_url, document_public_id,
         "fileName", "fileSize", description, category, type, status, "publishDate", pages, language, created_at
  FROM books
`;

const rateLimitMap = new Map();

export function isStrongPassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export function rateLimit(ip, limit = 60, windowMs = 60000) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }
    entry.count += 1;
    return entry.count <= limit;
}

export async function ensureDb() {
    if (!initPromise) {
        initPromise = (async () => {
            const sql = getSql();

            await sql.query(`
              CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                owner_email TEXT,
                email TEXT,
                whatsapp TEXT,
                phone TEXT,
                institution TEXT,
                lane TEXT DEFAULT 'author',
                service_tier TEXT DEFAULT 'guided',
                timeline TEXT DEFAULT 'Flexible',
                region TEXT,
                isbn TEXT,
                cover TEXT,
                cover_thumb TEXT,
                cover_blur TEXT,
                cover_public_id TEXT,
                document_url TEXT,
                document_public_id TEXT,
                "fileName" TEXT,
                "fileSize" TEXT,
                description TEXT,
                category TEXT DEFAULT 'General',
                type TEXT DEFAULT 'book',
                status TEXT DEFAULT 'Pending',
                "publishDate" TEXT,
                pages INTEGER DEFAULT 0,
                language TEXT DEFAULT 'English',
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `);

            await sql.query(`
              CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                avatar TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `);

            await sql.query(`
              CREATE TABLE IF NOT EXISTS contact_leads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                lane TEXT NOT NULL,
                subject TEXT,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `);

            await sql.query(`
              CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                interest TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `);

            await sql.query(`
              CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                actor_email TEXT,
                action TEXT NOT NULL,
                entity_id TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `);

            if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
                const existing = await sql.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [process.env.ADMIN_EMAIL]);
                if (existing.length === 0) {
                    const hashed = await hash(process.env.ADMIN_PASSWORD, 10);
                    await sql.query(
                        'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)',
                        [randomUUID(), process.env.ADMIN_EMAIL, hashed, 'admin'],
                    );
                }
            }
        })();
    }

    return initPromise;
}

export async function recordAudit(actorEmail, action, entityId = null) {
    await ensureDb();
    const sql = getSql();
    await sql.query(
        'INSERT INTO audit_logs (id, actor_email, action, entity_id) VALUES ($1, $2, $3, $4)',
        [randomUUID(), actorEmail, action, entityId],
    );
}

export async function authenticateUser(email, password) {
    await ensureDb();
    const sql = getSql();
    const users = await sql.query('SELECT id, email, password, role FROM users WHERE email = $1 LIMIT 1', [email]);
    const user = users[0];
    if (!user) return null;

    const valid = await compare(password, user.password);
    if (!valid) return null;

    return { id: user.id, email: user.email, role: user.role };
}

export async function registerUser(name, email, password) {
    await ensureDb();
    const sql = getSql();
    const existing = await sql.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (existing.length > 0) {
        throw new Error('An account with this email already exists');
    }

    const hashed = await hash(password, 10);
    const id = randomUUID();
    await sql.query(
        'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)',
        [id, email, hashed, 'author'],
    );

    return { id, email, role: 'author', name };
}

export async function getAuthUser(request) {
    await ensureDb();
    const token = getBearerToken(request);
    if (!token) return null;

    const payload = await verifyAuthToken(token);
    if (!payload?.id) return null;

    const sql = getSql();
    const users = await sql.query('SELECT id, email, role FROM users WHERE id = $1 LIMIT 1', [payload.id]);
    return users[0] || null;
}

export async function getHealth() {
    await ensureDb();
    const sql = getSql();
    const [publishedResult, pendingResult, usersResult] = await sql.transaction([
        sql.query("SELECT COUNT(*)::int AS count FROM books WHERE status = 'Published'"),
        sql.query("SELECT COUNT(*)::int AS count FROM books WHERE status = 'Pending'"),
        sql.query('SELECT COUNT(*)::int AS count FROM users'),
    ]);

    return {
        status: 'ok',
        service: 'dream-valley-api',
        timestamp: new Date().toISOString(),
        adminSeedConfigured: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
        counts: {
            published: publishedResult[0]?.count || 0,
            pending: pendingResult[0]?.count || 0,
            users: usersResult[0]?.count || 0,
        },
    };
}

export async function getBooks({ actor, status, type, category, search }) {
    await ensureDb();
    const sql = getSql();
    const conditions = [];
    const params = [];

    const isAdmin = actor?.role === 'admin' || actor?.role === 'editor';

    if (!isAdmin) {
        params.push('Published');
        conditions.push(`status = $${params.length}`);
    } else if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }

    if (type) {
        params.push(type);
        conditions.push(`type = $${params.length}`);
    }

    if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
    }

    if (search) {
        const value = `%${search}%`;
        params.push(value);
        const titleIndex = params.length;
        params.push(value);
        const authorIndex = params.length;
        params.push(value);
        const isbnIndex = params.length;
        conditions.push(`(title ILIKE $${titleIndex} OR author ILIKE $${authorIndex} OR isbn ILIKE $${isbnIndex})`);
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    return sql.query(`${baseBookSelect}${whereClause} ORDER BY created_at DESC`, params);
}

export async function getBookById(id) {
    await ensureDb();
    const sql = getSql();
    const rows = await sql.query(`${baseBookSelect} WHERE id = $1 LIMIT 1`, [id]);
    return rows[0] || null;
}

export async function getMySubmissions(email) {
    await ensureDb();
    const sql = getSql();
    return sql.query(`${baseBookSelect} WHERE owner_email = $1 OR email = $2 ORDER BY created_at DESC`, [email, email]);
}

export async function getAdminAudit() {
    await ensureDb();
    const sql = getSql();
    return sql.query('SELECT id, actor_email, action, entity_id, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 100');
}

export async function getAdminMetrics() {
    await ensureDb();
    const sql = getSql();
    const [published, pending, leads, subscribers, authors] = await sql.transaction([
        sql.query("SELECT COUNT(*)::int AS count FROM books WHERE status = 'Published'"),
        sql.query("SELECT COUNT(*)::int AS count FROM books WHERE status = 'Pending'"),
        sql.query('SELECT COUNT(*)::int AS count FROM contact_leads'),
        sql.query('SELECT COUNT(*)::int AS count FROM newsletter_subscribers'),
        sql.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'author'"),
    ]);

    return {
        published: published[0]?.count || 0,
        pending: pending[0]?.count || 0,
        leads: leads[0]?.count || 0,
        subscribers: subscribers[0]?.count || 0,
        authors: authors[0]?.count || 0,
        timestamp: new Date().toISOString(),
    };
}

export async function createSubmission(body) {
    await ensureDb();
    const sql = getSql();
    const id = randomUUID();

    await sql.query(`
        INSERT INTO books (
            id, title, author, owner_email, email, whatsapp, phone, institution, lane, service_tier, timeline, region,
            isbn, cover, cover_thumb, cover_blur, cover_public_id, document_url, document_public_id,
            "fileName", "fileSize", description, category, type, status, pages, language
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24, 'Pending', $25, $26
        )
    `, [
        id,
        body.title,
        body.author,
        body.ownerEmail || body.email || null,
        body.email || null,
        body.whatsapp || null,
        body.phone || null,
        body.institution || null,
        body.lane || 'author',
        body.serviceTier || 'guided',
        body.timeline || 'Flexible',
        body.region || null,
        body.isbn || null,
        body.cover || null,
        body.cover_thumb || null,
        body.cover_blur || null,
        body.cover_public_id || null,
        body.document_url || null,
        body.document_public_id || null,
        body.fileName || null,
        body.fileSize || null,
        body.description || '',
        body.category || 'General',
        body.type || 'book',
        body.pages || 0,
        body.language || 'English',
    ]);

    return getBookById(id);
}

export async function updateSubmission(id, body, actorEmail) {
    await ensureDb();
    const current = await getBookById(id);
    if (!current) return null;

    const sql = getSql();
    const publishDate = body.status === 'Published' && !current.publishDate ? new Date().toISOString() : current.publishDate;

    await sql.query(`
        UPDATE books
        SET title = $1, author = $2, email = $3, whatsapp = $4, phone = $5, institution = $6, lane = $7, service_tier = $8,
            timeline = $9, region = $10, isbn = $11, cover = $12, cover_thumb = $13, cover_blur = $14, cover_public_id = $15,
            document_url = $16, document_public_id = $17, "fileName" = $18, "fileSize" = $19, description = $20, category = $21,
            type = $22, status = $23, pages = $24, language = $25, "publishDate" = $26
        WHERE id = $27
    `, [
        body.title ?? current.title,
        body.author ?? current.author,
        body.email ?? current.email,
        body.whatsapp ?? current.whatsapp,
        body.phone ?? current.phone,
        body.institution ?? current.institution,
        body.lane ?? current.lane,
        body.service_tier ?? body.serviceTier ?? current.service_tier,
        body.timeline ?? current.timeline,
        body.region ?? current.region,
        body.isbn ?? current.isbn,
        body.cover ?? current.cover,
        body.cover_thumb ?? current.cover_thumb,
        body.cover_blur ?? current.cover_blur,
        body.cover_public_id ?? current.cover_public_id,
        body.document_url ?? current.document_url,
        body.document_public_id ?? current.document_public_id,
        body.fileName ?? current.fileName,
        body.fileSize ?? current.fileSize,
        body.description ?? current.description,
        body.category ?? current.category,
        body.type ?? current.type,
        body.status ?? current.status,
        body.pages ?? current.pages,
        body.language ?? current.language,
        publishDate,
        id,
    ]);

    await recordAudit(actorEmail, 'submission.update', id);
    return getBookById(id);
}

export async function deleteSubmission(id, actorEmail) {
    await ensureDb();
    const sql = getSql();
    const current = await getBookById(id);
    if (!current) return null;

    await sql.query('DELETE FROM books WHERE id = $1', [id]);
    await recordAudit(actorEmail, 'submission.delete', id);
    return current;
}

export async function createContactLead(body) {
    await ensureDb();
    const sql = getSql();
    const id = randomUUID();
    await sql.query(
        'INSERT INTO contact_leads (id, name, email, lane, subject, message) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, body.name, body.email, body.lane, body.subject || null, body.message],
    );
    await recordAudit(body.email, 'contact.created', id);
    return { success: true, id };
}

export async function subscribeNewsletter(body) {
    await ensureDb();
    const sql = getSql();
    const existing = await sql.query('SELECT id FROM newsletter_subscribers WHERE email = $1 LIMIT 1', [body.email]);
    if (existing.length > 0) {
        return { success: true, message: 'Already subscribed' };
    }

    const id = randomUUID();
    await sql.query(
        'INSERT INTO newsletter_subscribers (id, email, interest) VALUES ($1, $2, $3)',
        [id, body.email, body.interest || null],
    );
    await recordAudit(body.email, 'newsletter.subscribed', id);
    return { success: true, id };
}
