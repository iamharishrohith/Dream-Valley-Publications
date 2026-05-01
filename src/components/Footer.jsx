'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { COMPANY } from '@/lib/site';

export const Footer = () => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const footerLogoSrc = mounted && theme === 'dark'
        ? '/Assets/new_dark-logo-bgrmrv.png'
        : '/Assets/new-white-logo-bgrmrv.png';

    return (
        <footer className="footer">
            <div className="container py-12">
                <div className="footer-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Image
                            src={footerLogoSrc}
                            alt={COMPANY.name}
                            width={180}
                            height={180}
                            style={{ objectFit: 'contain', borderRadius: '12px' }}
                        />
                        <p className="text-sm text-gray" style={{ lineHeight: 1.7 }}>
                            {COMPANY.mission}
                        </p>
                        <p className="text-sm text-gray">
                            {COMPANY.supportEmail}<br />
                            {COMPANY.phone}<br />
                            {COMPANY.region} · {COMPANY.timezone}
                        </p>
                    </div>
                    <div>
                        <h4 className="footer-heading">Publishing</h4>
                        <ul className="footer-links">
                            <li><Link href="/services">Services</Link></li>
                            <li><Link href="/process">How It Works</Link></li>
                            <li><Link href="/pricing">Service Tiers</Link></li>
                            <li><Link href="/publish">Start Submission</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Trust</h4>
                        <ul className="footer-links">
                            <li><Link href="/trust">Trust & Standards</Link></li>
                            <li><Link href="/editorial">Editorial Promise</Link></li>
                            <li><Link href="/privacy">Privacy</Link></li>
                            <li><Link href="/terms">Terms</Link></li>
                            <li><Link href="/for-authors">Author Guidance</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Discover</h4>
                        <ul className="footer-links">
                            <li><Link href="/resources">Resources</Link></li>
                            <li><Link href="/books">Books</Link></li>
                            <li><Link href="/journals">Journals</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    © {new Date().getFullYear()} {COMPANY.name}. Premium publishing for academics and serious authors.
                </div>
            </div>
        </footer>
    );
};
