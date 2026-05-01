import { uploadImage } from '@/lib/server/cloudinary';
import { json, error, applyRateLimit } from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
    if (!applyRateLimit(request)) return error('Too many requests. Please try again later.', 429);

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'dvp/covers';

        if (!file) return error('No file provided', 400);
        if (file.size > 10 * 1024 * 1024) return error('File too large (max 10MB)', 400);
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            return error('Invalid image type. Allowed: JPEG, PNG, WebP, GIF', 400);
        }

        return json(await uploadImage(file, folder));
    } catch (err) {
        return error(err.message || 'Image upload failed', 500);
    }
}
