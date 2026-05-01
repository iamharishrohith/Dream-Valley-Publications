import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';
import { Database } from 'bun:sqlite';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { firestore, verifyToken } from './services/firebase';
import { uploadImage, uploadDocument, deleteImage } from './services/cloudinary';

type AuthUser = { id: string; email: string; role: string; provider: 'jwt' | 'firebase' };

function isStrongPassword(password: string) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password);
}

const DATABASE_PATH = process.env.DATABASE_PATH || 'dvp.db';
const db = new Database(DATABASE_PATH, { create: true });
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`
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
    fileName TEXT,
    fileSize TEXT,
    description TEXT,
    category TEXT DEFAULT 'General',
    type TEXT DEFAULT 'book',
    status TEXT DEFAULT 'Pending',
    publishDate TEXT,
    pages INTEGER DEFAULT 0,
    language TEXT DEFAULT 'English',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS contact_leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    lane TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    interest TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const ensureColumn = (table: string, column: string, definition: string) => {
    const columns = db.query(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (!columns.some((entry) => entry.name === column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    }
};

ensureColumn('books', 'email', 'TEXT');
ensureColumn('books', 'owner_email', 'TEXT');
ensureColumn('books', 'whatsapp', 'TEXT');
ensureColumn('books', 'phone', 'TEXT');
ensureColumn('books', 'institution', 'TEXT');
ensureColumn('books', 'lane', "TEXT DEFAULT 'author'");
ensureColumn('books', 'service_tier', "TEXT DEFAULT 'guided'");
ensureColumn('books', 'timeline', "TEXT DEFAULT 'Flexible'");
ensureColumn('books', 'region', 'TEXT');
ensureColumn('books', 'document_url', 'TEXT');
ensureColumn('books', 'document_public_id', 'TEXT');
ensureColumn('books', 'fileName', 'TEXT');
ensureColumn('books', 'fileSize', 'TEXT');

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (adminEmail && adminPassword) {
    const adminExists = db.query('SELECT COUNT(*) as c FROM users WHERE email = ?').get(adminEmail) as { c: number };
    if (adminExists.c === 0) {
        const hashedPw = await Bun.password.hash(adminPassword, { algorithm: 'bcrypt', cost: 10 });
        db.prepare('INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)').run(
            crypto.randomUUID(),
            adminEmail,
            hashedPw,
            'admin'
        );
    }
}

const UPLOADS_DIR = join(import.meta.dir, 'uploads');
await mkdir(UPLOADS_DIR, { recursive: true });

const isProduction = process.env.NODE_ENV === 'production';
const trustProxyHeaders = process.env.TRUST_PROXY_HEADERS === 'true';
const configuredCorsOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'];
const allowedOrigins = configuredCorsOrigins.length > 0 ? configuredCorsOrigins : (isProduction ? [] : defaultDevOrigins);
const jwtSecretFromEnv = process.env.JWT_SECRET?.trim();
const JWT_SECRET = jwtSecretFromEnv || crypto.randomUUID();
const PORT = Number(process.env.PORT || 3001);
const useFirebase = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY);

if (!jwtSecretFromEnv && isProduction) {
    throw new Error('JWT_SECRET must be set in production.');
}

if (isProduction && allowedOrigins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS must be set in production.');
}

if (isProduction && (!adminEmail || !adminPassword)) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in production.');
}

if (isProduction && adminPassword && !isStrongPassword(adminPassword)) {
    throw new Error('ADMIN_PASSWORD must meet the strong password policy in production.');
}

if (!jwtSecretFromEnv) {
    console.warn('JWT_SECRET not set. Using an ephemeral secret for local development only.');
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const loginAttemptMap = new Map<string, { count: number; lockedUntil: number; lastAttemptAt: number }>();
const rateLimit = (key: string, limit = 60, windowMs = 60000): boolean => {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    entry.count += 1;
    return entry.count <= limit;
};

const LOGIN_LOCK_THRESHOLD = 5;
const LOGIN_LOCK_WINDOW_MS = 15 * 60_000;

const getLoginAttemptState = (key: string) => {
    const now = Date.now();
    const current = loginAttemptMap.get(key);
    if (!current) return { count: 0, lockedUntil: 0, lastAttemptAt: now };
    if (current.lockedUntil && now < current.lockedUntil) return current;
    if (now - current.lastAttemptAt > LOGIN_LOCK_WINDOW_MS) {
        const reset = { count: 0, lockedUntil: 0, lastAttemptAt: now };
        loginAttemptMap.set(key, reset);
        return reset;
    }
    return current;
};

const registerLoginFailure = (key: string) => {
    const now = Date.now();
    const current = getLoginAttemptState(key);
    const count = current.count + 1;
    const lockedUntil = count >= LOGIN_LOCK_THRESHOLD ? now + LOGIN_LOCK_WINDOW_MS : 0;
    loginAttemptMap.set(key, { count, lockedUntil, lastAttemptAt: now });
    return { count, lockedUntil };
};

const clearLoginFailures = (key: string) => {
    loginAttemptMap.delete(key);
};

const recordAudit = (actorEmail: string | null, action: string, entityId?: string) => {
    db.prepare('INSERT INTO audit_logs (id, actor_email, action, entity_id) VALUES (?, ?, ?, ?)').run(
        crypto.randomUUID(),
        actorEmail,
        action,
        entityId || null
    );
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const VALID_STATUSES = new Set(['Pending', 'Published', 'Archived', 'Review']);
const VALID_TYPES = new Set(['book', 'journal']);

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const sanitizeText = (value: string | null | undefined, maxLength: number) => value?.trim().slice(0, maxLength) || '';
const sanitizeOptionalText = (value: string | null | undefined, maxLength: number) => {
    const sanitized = sanitizeText(value, maxLength);
    return sanitized || null;
};

const validateEmail = (email: string) => EMAIL_REGEX.test(normalizeEmail(email));
const validatePhone = (phone: string) => SAFE_PHONE_REGEX.test(phone.trim());

const getClientIp = (request: Request) => {
    if (trustProxyHeaders) {
        const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
        const realIp = request.headers.get('x-real-ip')?.trim();
        if (forwarded) return forwarded;
        if (realIp) return realIp;
    }

    return 'local';
};

const getRatePolicy = (path: string) => {
    if (path.startsWith('/api/auth/login')) return { limit: 8, windowMs: 60_000 };
    if (path.startsWith('/api/auth/register')) return { limit: 5, windowMs: 60_000 };
    if (path.startsWith('/api/upload/')) return { limit: 12, windowMs: 60_000 };
    if (path.startsWith('/api/contact') || path.startsWith('/api/newsletter') || path.startsWith('/api/submissions')) {
        return { limit: 20, windowMs: 60_000 };
    }

    return { limit: 60, windowMs: 60_000 };
};

const hasImageSignature = async (file: File) => {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const matches = {
        jpeg: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
        png: bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
        gif: bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46,
        webp: bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50,
    };

    return Object.values(matches).some(Boolean);
};

const hasDocumentSignature = async (file: File) => {
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    const isOleDoc = bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
    const isZipContainer = bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

    return isPdf || isOleDoc || isZipContainer;
};

const getAuthUser = async (bearerToken: string | null | undefined, jwtTools: { verify: (token: string) => Promise<any> }): Promise<AuthUser | null> => {
    if (!bearerToken) return null;

    const firebaseUser = await verifyToken(bearerToken);
    if (firebaseUser) {
        const role = (firebaseUser as any).role || ((firebaseUser as any).admin ? 'admin' : 'user');
        return { id: firebaseUser.uid, email: firebaseUser.email || '', role, provider: 'firebase' };
    }

    const payload = await jwtTools.verify(bearerToken);
    if (!payload?.id) return null;
    const user = db.query('SELECT id, email, role FROM users WHERE id = ?').get(payload.id as string) as any;
    if (!user) return null;
    return { ...user, provider: 'jwt' };
};

const baseBookSelect = `
  SELECT id, title, author, owner_email, email, whatsapp, phone, institution, lane, service_tier, timeline, region,
         isbn, cover, cover_thumb, cover_blur, cover_public_id, document_url, document_public_id,
         fileName, fileSize, description, category, type, status, publishDate, pages, language, created_at
  FROM books
`;

const app = new Elysia()
    .use(cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false,
    }))
    .use(jwt({ name: 'jwt', secret: JWT_SECRET }))
    .use(bearer())
    .onAfterHandle(({ set }) => {
        set.headers['X-Content-Type-Options'] = 'nosniff';
        set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
        set.headers['X-Frame-Options'] = 'DENY';
        set.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
        set.headers['Cross-Origin-Resource-Policy'] = 'same-site';
        set.headers['Cross-Origin-Opener-Policy'] = 'same-origin';
        set.headers['Cache-Control'] = 'no-store';
        if (isProduction) {
            set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        }
    })
    .onBeforeHandle(({ request, set }) => {
        const path = new URL(request.url).pathname;
        const ip = getClientIp(request);
        const policy = getRatePolicy(path);
        if (!rateLimit(`${path}:${ip}`, policy.limit, policy.windowMs)) {
            set.status = 429;
            return { error: 'Too many requests. Please try again later.' };
        }
    })

    .get('/api/health', () => {
        const counts = {
            published: (db.query("SELECT COUNT(*) as count FROM books WHERE status = 'Published'").get() as any)?.count || 0,
            pending: (db.query("SELECT COUNT(*) as count FROM books WHERE status = 'Pending'").get() as any)?.count || 0,
            users: (db.query('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0,
        };

        return {
            status: 'ok',
            service: 'dream-valley-api',
            timestamp: new Date().toISOString(),
            firebaseConfigured: useFirebase,
            adminSeedConfigured: !!(adminEmail && adminPassword),
            counts,
        };
    })

    .post('/api/auth/login', async ({ body, jwt, request, set }) => {
        const email = normalizeEmail(body.email);
        if (!validateEmail(email)) {
            set.status = 400;
            return { error: 'Please provide a valid email address' };
        }
        const clientKey = `${email}:${getClientIp(request)}`;
        const loginState = getLoginAttemptState(clientKey);
        if (loginState.lockedUntil && loginState.lockedUntil > Date.now()) {
            set.status = 429;
            return { error: 'Too many failed login attempts. Please try again later.' };
        }

        const user = db.query('SELECT * FROM users WHERE email = ?').get(email) as any;
        if (!user) {
            registerLoginFailure(clientKey);
            set.status = 401;
            return { error: 'Invalid credentials' };
        }

        const valid = await Bun.password.verify(body.password, user.password);
        if (!valid) {
            registerLoginFailure(clientKey);
            set.status = 401;
            return { error: 'Invalid credentials' };
        }

        clearLoginFailures(clientKey);
        const token = await jwt.sign({ id: user.id, email: user.email, role: user.role });
        recordAudit(user.email, 'auth.login', user.id);

        return { token, user: { id: user.id, email: user.email, role: user.role }, provider: 'jwt' };
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
        }),
    })

    .post('/api/auth/register', async ({ body, jwt, set }) => {
        const email = normalizeEmail(body.email);
        const name = sanitizeText(body.name, 120);
        if (!name) {
            set.status = 400;
            return { error: 'Name is required' };
        }
        if (!validateEmail(email)) {
            set.status = 400;
            return { error: 'Please provide a valid email address' };
        }

        const existing = db.query('SELECT id FROM users WHERE email = ?').get(email) as any;
        if (existing) {
            set.status = 409;
            return { error: 'An account with this email already exists' };
        }
        if (!isStrongPassword(body.password)) {
            set.status = 400;
            return { error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' };
        }

        const id = crypto.randomUUID();
        const hashedPw = await Bun.password.hash(body.password, { algorithm: 'bcrypt', cost: 10 });
        db.prepare('INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)').run(
            id,
            email,
            hashedPw,
            'author'
        );

        const token = await jwt.sign({ id, email, role: 'author' });
        recordAudit(email, 'auth.register', id);
        return { token, user: { id, email, role: 'author', name }, provider: 'jwt' };
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            password: t.String(),
        }),
    })

    .get('/api/auth/me', async ({ bearer, jwt, set }) => {
        const user = await getAuthUser(bearer, jwt);
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }
        return user;
    })

    .get('/api/auth/submissions', async ({ bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        return db.query(`${baseBookSelect} WHERE owner_email = ? OR email = ? ORDER BY created_at DESC`).all(actor.email, actor.email);
    })

    .get('/api/books', async ({ query, bearer, jwt }) => {
        const actor = await getAuthUser(bearer, jwt);
        const isAdmin = actor?.role === 'admin' || actor?.role === 'editor';
        let sql = `${baseBookSelect}`;
        const params: any[] = [];
        const conditions: string[] = [];
        const status = typeof query.status === 'string' ? sanitizeText(query.status, 40) : '';
        const type = typeof query.type === 'string' ? sanitizeText(query.type, 40) : '';
        const category = typeof query.category === 'string' ? sanitizeText(query.category, 80) : '';
        const searchQuery = typeof query.search === 'string' ? sanitizeText(query.search, 120) : '';

        if (!isAdmin) {
            conditions.push('status = ?');
            params.push('Published');
        } else if (status && VALID_STATUSES.has(status)) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (type && VALID_TYPES.has(type)) { conditions.push('type = ?'); params.push(type); }
        if (category) { conditions.push('category = ?'); params.push(category); }
        if (searchQuery) {
            conditions.push('(title LIKE ? OR author LIKE ? OR isbn LIKE ?)');
            const search = `%${searchQuery}%`;
            params.push(search, search, search);
        }

        if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
        sql += ' ORDER BY created_at DESC';

        return db.query(sql).all(...params);
    })

    .get('/api/books/:id', async ({ params, bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        const book = db.query(`${baseBookSelect} WHERE id = ?`).get(params.id) as any;
        if (!book) {
            set.status = 404;
            return { error: 'Book not found' };
        }
        if (book.status !== 'Published' && actor?.role !== 'admin' && actor?.role !== 'editor') {
            set.status = 404;
            return { error: 'Book not found' };
        }
        return book;
    })

    .get('/api/admin/submissions', async ({ bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor || (actor.role !== 'admin' && actor.role !== 'editor')) {
            set.status = 403;
            return { error: 'Admin access required' };
        }
        return db.query(`${baseBookSelect} ORDER BY created_at DESC`).all();
    })

    .get('/api/admin/audit', async ({ bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor || (actor.role !== 'admin' && actor.role !== 'editor')) {
            set.status = 403;
            return { error: 'Admin access required' };
        }
        return db.query('SELECT id, actor_email, action, entity_id, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
    })

    .get('/api/admin/leads', async ({ bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor || (actor.role !== 'admin' && actor.role !== 'editor')) {
            set.status = 403;
            return { error: 'Admin access required' };
        }
        return db.query('SELECT * FROM contact_leads ORDER BY created_at DESC').all();
    })

    .get('/api/admin/metrics', async ({ bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor || (actor.role !== 'admin' && actor.role !== 'editor')) {
            set.status = 403;
            return { error: 'Admin access required' };
        }

        const published = (db.query("SELECT COUNT(*) as count FROM books WHERE status = 'Published'").get() as any)?.count || 0;
        const pending = (db.query("SELECT COUNT(*) as count FROM books WHERE status = 'Pending'").get() as any)?.count || 0;
        const leads = (db.query('SELECT COUNT(*) as count FROM contact_leads').get() as any)?.count || 0;
        const subscribers = (db.query('SELECT COUNT(*) as count FROM newsletter_subscribers').get() as any)?.count || 0;
        const authors = (db.query("SELECT COUNT(*) as count FROM users WHERE role = 'author'").get() as any)?.count || 0;

        return {
            published,
            pending,
            leads,
            subscribers,
            authors,
            timestamp: new Date().toISOString(),
        };
    })

    .post('/api/submissions', async ({ body, set }) => {
        const email = normalizeEmail(body.email);
        const ownerEmail = normalizeEmail(body.ownerEmail || body.email);
        const title = sanitizeText(body.title, 180);
        const author = sanitizeText(body.author, 160);
        const description = sanitizeText(body.description, 4000);
        const whatsapp = sanitizeText(body.whatsapp, 20);
        const phone = sanitizeText(body.phone, 20);

        if (!validateEmail(email)) {
            set.status = 400;
            return { error: 'Please provide a valid email address' };
        }
        if (!title || !author || !description) {
            set.status = 400;
            return { error: 'Title, author, and description are required' };
        }
        if (!validatePhone(whatsapp) || !validatePhone(phone)) {
            set.status = 400;
            return { error: 'Please provide valid phone and WhatsApp numbers' };
        }
        if (body.type && !VALID_TYPES.has(body.type)) {
            set.status = 400;
            return { error: 'Invalid submission type' };
        }

        const id = crypto.randomUUID();
        db.prepare(`
            INSERT INTO books (
                id, title, author, owner_email, email, whatsapp, phone, institution, lane, service_tier, timeline, region,
                isbn, cover, cover_thumb, cover_blur, cover_public_id, document_url, document_public_id,
                fileName, fileSize, description, category, type, status, pages, language
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
        `).run(
            id,
            title,
            author,
            ownerEmail || null,
            email,
            whatsapp || null,
            phone || null,
            sanitizeOptionalText(body.institution, 180),
            sanitizeText(body.lane || 'author', 40),
            sanitizeText(body.serviceTier || 'guided', 40),
            sanitizeText(body.timeline || 'Flexible', 60),
            sanitizeOptionalText(body.region, 80),
            sanitizeOptionalText(body.isbn, 40),
            body.cover || null,
            body.cover_thumb || null,
            body.cover_blur || null,
            body.cover_public_id || null,
            body.document_url || null,
            body.document_public_id || null,
            sanitizeOptionalText(body.fileName, 200),
            sanitizeOptionalText(body.fileSize, 40),
            description,
            sanitizeText(body.category || 'General', 80),
            sanitizeText(body.type || 'book', 40),
            body.pages || 0,
            sanitizeText(body.language || 'English', 40)
        );

        const created = db.query(`${baseBookSelect} WHERE id = ?`).get(id);

        if (useFirebase) {
            try {
                await firestore.collection('books').doc(id).set(created as any);
            } catch (error) {
                console.error('Firestore sync error:', error);
            }
        }

        return created;
    }, {
        body: t.Object({
            title: t.String(),
            author: t.String(),
            email: t.String(),
            ownerEmail: t.Optional(t.String()),
            whatsapp: t.String(),
            phone: t.String(),
            institution: t.Optional(t.String()),
            lane: t.Optional(t.String()),
            serviceTier: t.Optional(t.String()),
            timeline: t.Optional(t.String()),
            region: t.Optional(t.String()),
            isbn: t.Optional(t.String()),
            cover: t.Optional(t.Union([t.String(), t.Null()])),
            cover_thumb: t.Optional(t.Union([t.String(), t.Null()])),
            cover_blur: t.Optional(t.Union([t.String(), t.Null()])),
            cover_public_id: t.Optional(t.Union([t.String(), t.Null()])),
            document_url: t.Optional(t.Union([t.String(), t.Null()])),
            document_public_id: t.Optional(t.Union([t.String(), t.Null()])),
            fileName: t.Optional(t.Union([t.String(), t.Null()])),
            fileSize: t.Optional(t.Union([t.String(), t.Null()])),
            description: t.String(),
            category: t.Optional(t.String()),
            type: t.Optional(t.String()),
            pages: t.Optional(t.Number()),
            language: t.Optional(t.String()),
        }),
    })

    .put('/api/books/:id', async ({ params, body, bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor || (actor.role !== 'admin' && actor.role !== 'editor')) {
            set.status = 403;
            return { error: 'Admin access required' };
        }

        const current = db.query(`${baseBookSelect} WHERE id = ?`).get(params.id) as any;
        if (!current) {
            set.status = 404;
            return { error: 'Submission not found' };
        }

        if (body.email && !validateEmail(body.email)) {
            set.status = 400;
            return { error: 'Please provide a valid email address' };
        }
        if (body.phone && !validatePhone(body.phone)) {
            set.status = 400;
            return { error: 'Please provide a valid phone number' };
        }
        if (body.whatsapp && !validatePhone(body.whatsapp)) {
            set.status = 400;
            return { error: 'Please provide a valid WhatsApp number' };
        }
        if (body.status && !VALID_STATUSES.has(body.status)) {
            set.status = 400;
            return { error: 'Invalid status value' };
        }
        if (body.type && !VALID_TYPES.has(body.type)) {
            set.status = 400;
            return { error: 'Invalid submission type' };
        }

        db.prepare(`
            UPDATE books
            SET title = ?, author = ?, email = ?, whatsapp = ?, phone = ?, institution = ?, lane = ?, service_tier = ?,
                timeline = ?, region = ?, isbn = ?, cover = ?, cover_thumb = ?, cover_blur = ?, cover_public_id = ?,
                document_url = ?, document_public_id = ?, fileName = ?, fileSize = ?, description = ?, category = ?,
                type = ?, status = ?, pages = ?, language = ?, publishDate = ?
            WHERE id = ?
        `).run(
            body.title ? sanitizeText(body.title, 180) : current.title,
            body.author ? sanitizeText(body.author, 160) : current.author,
            body.email ? normalizeEmail(body.email) : current.email,
            body.whatsapp ? sanitizeText(body.whatsapp, 20) : current.whatsapp,
            body.phone ? sanitizeText(body.phone, 20) : current.phone,
            body.institution !== undefined ? sanitizeOptionalText(body.institution, 180) : current.institution,
            body.lane ? sanitizeText(body.lane, 40) : current.lane,
            body.service_tier ? sanitizeText(body.service_tier, 40) : body.serviceTier ? sanitizeText(body.serviceTier, 40) : current.service_tier,
            body.timeline ? sanitizeText(body.timeline, 60) : current.timeline,
            body.region !== undefined ? sanitizeOptionalText(body.region, 80) : current.region,
            body.isbn !== undefined ? sanitizeOptionalText(body.isbn, 40) : current.isbn,
            body.cover ?? current.cover,
            body.cover_thumb ?? current.cover_thumb,
            body.cover_blur ?? current.cover_blur,
            body.cover_public_id ?? current.cover_public_id,
            body.document_url ?? current.document_url,
            body.document_public_id ?? current.document_public_id,
            body.fileName !== undefined ? sanitizeOptionalText(body.fileName, 200) : current.fileName,
            body.fileSize !== undefined ? sanitizeOptionalText(body.fileSize, 40) : current.fileSize,
            body.description ? sanitizeText(body.description, 4000) : current.description,
            body.category ? sanitizeText(body.category, 80) : current.category,
            body.type ? sanitizeText(body.type, 40) : current.type,
            body.status ?? current.status,
            body.pages ?? current.pages,
            body.language ? sanitizeText(body.language, 40) : current.language,
            body.status === 'Published' && !current.publishDate ? new Date().toISOString() : current.publishDate,
            params.id
        );

        const updated = db.query(`${baseBookSelect} WHERE id = ?`).get(params.id);
        recordAudit(actor.email, 'submission.update', params.id);

        if (useFirebase) {
            try {
                await firestore.collection('books').doc(params.id).set(updated as any, { merge: true });
            } catch (error) {
                console.error('Firestore sync error:', error);
            }
        }

        return updated;
    }, {
        body: t.Object({
            title: t.Optional(t.String()),
            author: t.Optional(t.String()),
            email: t.Optional(t.String()),
            whatsapp: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            institution: t.Optional(t.String()),
            lane: t.Optional(t.String()),
            serviceTier: t.Optional(t.String()),
            service_tier: t.Optional(t.String()),
            timeline: t.Optional(t.String()),
            region: t.Optional(t.String()),
            isbn: t.Optional(t.String()),
            cover: t.Optional(t.Union([t.String(), t.Null()])),
            cover_thumb: t.Optional(t.Union([t.String(), t.Null()])),
            cover_blur: t.Optional(t.Union([t.String(), t.Null()])),
            cover_public_id: t.Optional(t.Union([t.String(), t.Null()])),
            document_url: t.Optional(t.Union([t.String(), t.Null()])),
            document_public_id: t.Optional(t.Union([t.String(), t.Null()])),
            fileName: t.Optional(t.Union([t.String(), t.Null()])),
            fileSize: t.Optional(t.Union([t.String(), t.Null()])),
            description: t.Optional(t.String()),
            category: t.Optional(t.String()),
            type: t.Optional(t.String()),
            status: t.Optional(t.String()),
            pages: t.Optional(t.Number()),
            language: t.Optional(t.String()),
        }),
    })

    .delete('/api/books/:id', async ({ params, bearer, jwt, set }) => {
        const actor = await getAuthUser(bearer, jwt);
        if (!actor || (actor.role !== 'admin' && actor.role !== 'editor')) {
            set.status = 403;
            return { error: 'Admin access required' };
        }

        const book = db.query(`${baseBookSelect} WHERE id = ?`).get(params.id) as any;
        if (!book) {
            set.status = 404;
            return { error: 'Submission not found' };
        }

        if (book.cover_public_id) {
            await deleteImage(book.cover_public_id);
        }

        db.prepare('DELETE FROM books WHERE id = ?').run(params.id);
        recordAudit(actor.email, 'submission.delete', params.id);

        if (useFirebase) {
            try {
                await firestore.collection('books').doc(params.id).delete();
            } catch (error) {
                console.error('Firestore sync error:', error);
            }
        }

        return { success: true };
    })

    .post('/api/upload/image', async ({ body, set }) => {
        const file = body.file;
        if (!file) {
            set.status = 400;
            return { error: 'No file provided' };
        }

        if (file.size > 10 * 1024 * 1024) {
            set.status = 400;
            return { error: 'File too large (max 10MB)' };
        }

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            set.status = 400;
            return { error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' };
        }
        if (!(await hasImageSignature(file))) {
            set.status = 400;
            return { error: 'File content does not match an allowed image format' };
        }

        return uploadImage(file, body.folder || 'dvp/covers');
    }, {
        body: t.Object({
            file: t.File(),
            folder: t.Optional(t.String()),
        }),
    })

    .post('/api/upload/document', async ({ body, set }) => {
        const file = body.file;
        if (!file) {
            set.status = 400;
            return { error: 'No file provided' };
        }

        if (file.size > 50 * 1024 * 1024) {
            set.status = 400;
            return { error: 'File too large (max 50MB)' };
        }

        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowed.includes(file.type)) {
            set.status = 400;
            return { error: 'Invalid document type. Allowed: PDF, DOC, DOCX' };
        }
        if (!(await hasDocumentSignature(file))) {
            set.status = 400;
            return { error: 'File content does not match an allowed document format' };
        }

        const result = await uploadDocument(file, file.name, body.folder || 'dvp/documents');
        return { ...result, originalName: file.name, size: file.size };
    }, {
        body: t.Object({
            file: t.File(),
            folder: t.Optional(t.String()),
        }),
    })

    .post('/api/contact', ({ body, set }) => {
        const email = normalizeEmail(body.email);
        if (!validateEmail(email)) {
            set.status = 400;
            return { error: 'Please provide a valid email address' };
        }

        const id = crypto.randomUUID();
        db.prepare('INSERT INTO contact_leads (id, name, email, lane, subject, message) VALUES (?, ?, ?, ?, ?, ?)').run(
            id,
            sanitizeText(body.name, 120),
            email,
            sanitizeText(body.lane, 60),
            sanitizeOptionalText(body.subject, 160),
            sanitizeText(body.message, 3000)
        );
        recordAudit(email, 'contact.created', id);
        return { success: true, id };
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            lane: t.String(),
            subject: t.Optional(t.String()),
            message: t.String(),
        }),
    })

    .post('/api/newsletter', ({ body, set }) => {
        const email = normalizeEmail(body.email);
        if (!validateEmail(email)) {
            set.status = 400;
            return { error: 'Please provide a valid email address' };
        }

        const existing = db.query('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email);
        if (existing) {
            return { success: true, message: 'Already subscribed' };
        }
        const id = crypto.randomUUID();
        db.prepare('INSERT INTO newsletter_subscribers (id, email, interest) VALUES (?, ?, ?)').run(
            id,
            email,
            sanitizeOptionalText(body.interest, 120)
        );
        recordAudit(email, 'newsletter.subscribed', id);
        set.status = 201;
        return { success: true, id };
    }, {
        body: t.Object({
            email: t.String(),
            interest: t.Optional(t.String()),
        }),
    })

    .listen(PORT);

console.log(`Dream Valley API running at http://localhost:${app.server?.port}`);
console.log(`SQLite database: ${DATABASE_PATH}`);
console.log(`Uploads: Cloudinary-backed where configured`);
console.log(`Security: rate limiting + protected admin routes + audit logging`);
