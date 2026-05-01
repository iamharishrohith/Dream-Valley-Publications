import { deleteImage } from '@/lib/server/cloudinary';
import { getBookById, updateSubmission, deleteSubmission, getAuthUser } from '@/lib/server/db';
import { json, error, applyRateLimit, requireAdmin } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    const actor = await getAuthUser(request);
    const book = await getBookById(params.id);
    if (!book) return error('Book not found', 404);
    if (book.status !== 'Published' && actor?.role !== 'admin' && actor?.role !== 'editor') {
        return error('Book not found', 404);
    }

    return json(book);
}

export async function PUT(request, { params }) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);
    const result = await requireAdmin(request);
    if (result.error) return result.error;

    try {
        const body = await request.json();
        const updated = await updateSubmission(params.id, body, result.user.email);
        if (!updated) return error('Submission not found', 404);
        return json(updated);
    } catch (err) {
        return error(err.message || 'Failed to update submission', 500);
    }
}

export async function DELETE(request, { params }) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);
    const result = await requireAdmin(request);
    if (result.error) return result.error;

    try {
        const removed = await deleteSubmission(params.id, result.user.email);
        if (!removed) return error('Submission not found', 404);
        if (removed.cover_public_id) {
            await deleteImage(removed.cover_public_id);
        }
        return json({ success: true });
    } catch (err) {
        return error(err.message || 'Failed to delete submission', 500);
    }
}
