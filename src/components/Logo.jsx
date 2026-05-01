'use client';

import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

export const Logo = () => {
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? '/Assets/Name Dark Mode Logo.png' : '/Assets/Name White Logo.png';

    return (
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
                src={logoSrc}
                alt="Dream Valley Publications"
                width={240}
                height={48}
                style={{ objectFit: 'contain', borderRadius: '12px' }}
                priority
            />
        </div>
    );
};
