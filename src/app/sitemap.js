import { getBooks } from '@/lib/server/db';
import { COMPANY } from '@/lib/site';

const SITE_URL = COMPANY.url;
const PUBLIC_ROUTES = [
    '',
    '/about',
    '/academics',
    '/books',
    '/contact',
    '/editorial',
    '/for-authors',
    '/journals',
    '/privacy',
    '/pricing',
    '/process',
    '/publish',
    '/resources',
    '/services',
    '/terms',
    '/trust',
];

export default async function sitemap() {
    const staticRoutes = PUBLIC_ROUTES.map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
    }));

    let bookRoutes = [];

    try {
        const books = await getBooks({});
        bookRoutes = books.map((book) => ({
            url: `${SITE_URL}/book/${book.id}`,
            lastModified: new Date(book.created_at || Date.now()),
            changeFrequency: 'monthly',
            priority: 0.6,
        }));
    } catch {
        bookRoutes = [];
    }

    return [...staticRoutes, ...bookRoutes];
}
