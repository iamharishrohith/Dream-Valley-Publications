import { uploadDocument } from '@/lib/server/cloudinary';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'dvp/documents';

        if (!file) return error('No file provided', 400);
        if (file.size > 50 * 1024 * 1024) return error('File too large (max 50MB)', 400);

        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowed.includes(file.type)) {
            return error('Invalid document type. Allowed: PDF, DOC, DOCX', 400);
        }

        const result = await uploadDocument(file, file.name, folder);
        return json({ ...result, originalName: file.name, size: file.size });
    } catch (err) {
        return error(err.message || 'Document upload failed', 500);
    }
}
