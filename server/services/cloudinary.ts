import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true,
});

const isConfigured = () =>
    !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const sanitizeFolder = (folder: string, fallback: string) => {
    const normalized = folder
        .replace(/\\/g, '/')
        .replace(/[^a-zA-Z0-9/_-]/g, '')
        .replace(/\/{2,}/g, '/')
        .replace(/^\/+|\/+$/g, '');

    return normalized || fallback;
};

const sanitizePublicId = (value: string, fallback: string) => {
    const normalized = value
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9/_-]/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^[-/]+|[-/]+$/g, '')
        .slice(0, 120);

    return normalized || fallback;
};

export async function uploadImage(
    file: File | Blob,
    folder: string = 'dvp/covers'
): Promise<{ url: string; publicId: string; thumbnail: string; blurUrl: string }> {
    const safeFolder = sanitizeFolder(folder, 'dvp/covers');

    if (!isConfigured()) {
        console.warn('Cloudinary not configured - using placeholder image');
        const placeholder = `https://placehold.co/800x600/1a1d27/4096ff?text=${encodeURIComponent(safeFolder)}`;
        return { url: placeholder, publicId: 'local', thumbnail: placeholder, blurUrl: placeholder };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: safeFolder,
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, uploadResult) => {
                if (error || !uploadResult) reject(error || new Error('Upload failed'));
                else resolve(uploadResult);
            }
        ).end(buffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnail: getOptimizedUrl(result.public_id, { width: 400, height: 300, crop: 'fill' }),
        blurUrl: getOptimizedUrl(result.public_id, { width: 30, height: 20, effect: 'blur:800', quality: 10 }),
    };
}

export async function uploadDocument(
    file: File | Blob,
    originalName: string,
    folder: string = 'dvp/documents'
): Promise<{ url: string; publicId: string; pages?: number }> {
    const safeFolder = sanitizeFolder(folder, 'dvp/documents');
    const safePublicId = sanitizePublicId(originalName, `document-${Date.now()}`);
    const safeFormat = (originalName.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase();

    if (!isConfigured()) {
        console.warn('Cloudinary not configured - document upload skipped');
        return { url: '#', publicId: 'local' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: safeFolder,
                resource_type: 'raw',
                public_id: safePublicId,
                format: safeFormat || 'bin',
            },
            (error, uploadResult) => {
                if (error || !uploadResult) reject(error || new Error('Upload failed'));
                else resolve(uploadResult);
            }
        ).end(buffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        pages: result.pages,
    };
}

export function getOptimizedUrl(
    publicId: string,
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: number | string;
        effect?: string;
    } = {}
): string {
    const transforms: string[] = [];

    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.effect) transforms.push(`e_${options.effect}`);

    if (transforms.length === 0) {
        transforms.push('q_auto', 'f_auto');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${publicId}`;
}

export async function deleteImage(publicId: string): Promise<boolean> {
    if (!isConfigured()) return true;
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch {
        return false;
    }
}

if (isConfigured()) {
    console.log(`Cloudinary configured (${process.env.CLOUDINARY_CLOUD_NAME})`);
} else {
    console.log('Cloudinary not configured - using local fallback');
}
