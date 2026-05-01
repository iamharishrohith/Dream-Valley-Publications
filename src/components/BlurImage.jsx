'use client';

import { useState, useCallback } from 'react';

const BlurImage = ({ src, alt, className = '', style = {} }) => {
    const [loaded, setLoaded] = useState(false);

    const handleLoad = useCallback(() => setLoaded(true), []);

    return (
        <div className="blur-up-wrapper">
            <img
                src={src}
                alt={alt}
                className={`${className} ${loaded ? 'loaded' : 'loading'}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
                onLoad={handleLoad}
                loading="lazy"
            />
        </div>
    );
};

export default BlurImage;
