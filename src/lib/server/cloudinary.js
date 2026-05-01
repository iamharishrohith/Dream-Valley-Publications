import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true,
});

function isConfigured() {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

export async function uploadImage(file, folder = 'dvp/covers') {
    if (!isConfigured()) {
        const placeholder = `https://placehold.co/800x600/1a1d27/4096ff?text=${encodeURIComponent(folder)}`;
        return { url: placeholder, publicId: 'local', thumbnail: placeholder, blurUrl: placeholder };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, uploaded) => {
                if (error || !uploaded) reject(error || new Error('Upload failed'));
                else resolve(uploaded);
            },
        ).end(buffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnail: getOptimizedUrl(result.public_id, { width: 400, height: 300, crop: 'fill' }),
        blurUrl: getOptimizedUrl(result.public_id, { width: 30, height: 20, effect: 'blur:800', quality: 10 }),
    };
}

export async function uploadDocument(file, originalName, folder = 'dvp/documents') {
    if (!isConfigured()) {
        return { url: '#', publicId: 'local' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'raw',
                public_id: originalName.replace(/\.[^.]+$/, ''),
                format: originalName.split('.').pop(),
            },
            (error, uploaded) => {
                if (error || !uploaded) reject(error || new Error('Upload failed'));
                else resolve(uploaded);
            },
        ).end(buffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        pages: result.pages,
    };
}

export function getOptimizedUrl(publicId, options = {}) {
    const transforms = [];

    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.effect) transforms.push(`e_${options.effect}`);

    if (transforms.length === 0) transforms.push('q_auto', 'f_auto');

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}

export async function deleteImage(publicId) {
    if (!isConfigured()) return true;
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch {
        return false;
    }
}
