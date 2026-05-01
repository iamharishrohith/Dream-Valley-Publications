'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Dropdown, Avatar, Drawer } from 'antd';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { CalendarDays, BookOpenText, ShieldCheck } from 'lucide-react';
import { DashboardOutlined, LogoutOutlined, SunOutlined, MoonOutlined, ScheduleOutlined } from '@ant-design/icons';
import MagneticButton from '@/components/MagneticButton';

const navSections = [
    {
        label: 'Services',
        items: [
            { key: 'services', label: <Link href="/services">Publishing Services</Link> },
            { key: 'academic', label: <Link href="/services#academic-publishing">Academic Publishing</Link> },
            { key: 'author', label: <Link href="/services#author-publishing">Author Publishing</Link> },
        ],
    },
    {
        label: 'Trust',
        items: [
            { key: 'process', label: <Link href="/process">Publishing Process</Link> },
            { key: 'pricing', label: <Link href="/pricing">Service Tiers</Link> },
            { key: 'trust', label: <Link href="/trust">Trust & Standards</Link> },
            { key: 'editorial', label: <Link href="/editorial">Editorial Promise</Link> },
        ],
    },
];

export const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const toggleRef = useRef(null);
    const toggleMobileRef = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleThemeToggle = useCallback((ref) => {
        if (ref.current) {
            ref.current.classList.add('theme-spin');
            setTimeout(() => ref.current?.classList.remove('theme-spin'), 500);
        }
        toggleTheme();
    }, [toggleTheme]);

    const userMenu = [
        { key: '1', label: <span className="font-semibold">{user?.email}</span>, disabled: true },
        { key: '2', label: user?.role === 'admin' ? 'Admin account' : user?.role, disabled: true },
        { type: 'divider' },
        { key: '3', label: 'Sign Out', icon: <LogoutOutlined />, onClick: logout, danger: true },
    ];

    return (
        <nav className="nav">
            <div className="nav-inner">
                <Link href="/" aria-label="Dream Valley Publications home"><Logo /></Link>

                <div className="desktop-only items-center gap-8">
                    <div className="nav-links">
                        {navSections.map((section) => (
                            <Dropdown key={section.label} menu={{ items: section.items }} placement="bottom">
                                <span className="nav-link hover-underline cursor-pointer">{section.label}</span>
                            </Dropdown>
                        ))}
                        <Link href="/resources" className={`nav-link hover-underline ${pathname.startsWith('/resources') ? 'active' : ''}`}>Resources</Link>
                        <Link href="/catalog" className={`nav-link hover-underline ${pathname.startsWith('/catalog') ? 'active' : ''}`}>Catalog</Link>
                        <Link href="/contact" className={`nav-link hover-underline ${pathname.startsWith('/contact') ? 'active' : ''}`}>Contact</Link>
                    </div>

                    <div className="nav-divider" />

                    <div className="flex items-center gap-3">
                        <button
                            ref={toggleRef}
                            className="theme-toggle"
                            onClick={() => handleThemeToggle(toggleRef)}
                            aria-label="Toggle theme"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light'
                                ? <MoonOutlined style={{ fontSize: '1.2rem' }} />
                                : <SunOutlined style={{ fontSize: '1.2rem', color: '#faad14' }} />}
                        </button>

                        <Link href="/contact">
                            <Button type="text" icon={<ScheduleOutlined />}>Consultation</Button>
                        </Link>

                        {user ? (
                            <>
                                <Link href={isAdmin ? '/admin' : '/dashboard'}>
                                    <Button type="text" icon={<DashboardOutlined />}>{isAdmin ? 'Dashboard' : 'My Dashboard'}</Button>
                                </Link>
                                <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                                    <Avatar style={{ cursor: 'pointer', border: '2px solid rgba(24,144,255,0.2)' }}>
                                        {user.email?.slice(0, 1).toUpperCase()}
                                    </Avatar>
                                </Dropdown>
                            </>
                        ) : (
                            <Link href="/publish">
                                <MagneticButton>
                                    <Button type="primary" shape="round" className="ripple-btn">
                                        Start Submission
                                    </Button>
                                </MagneticButton>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="mobile-only flex items-center gap-5">
                    <button
                        ref={toggleMobileRef}
                        className="theme-toggle"
                        onClick={() => handleThemeToggle(toggleMobileRef)}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light'
                            ? <MoonOutlined style={{ fontSize: '1.2rem' }} />
                            : <SunOutlined style={{ fontSize: '1.2rem', color: '#faad14' }} />}
                    </button>
                    <button
                        className={`hamburger ${mobileMenuOpen ? 'is-open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="hamburger-line" />
                        <span className="hamburger-line" />
                        <span className="hamburger-line" />
                    </button>
                </div>
            </div>

            <Drawer
                title="Navigate"
                placement="right"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                width={300}
            >
                <div className="mobile-nav-links">
                    <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text" icon={<BookOpenText size={16} />}>Services</Button>
                    </Link>
                    <Link href="/process" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text" icon={<CalendarDays size={16} />}>Process</Button>
                    </Link>
                    <Link href="/trust" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text" icon={<ShieldCheck size={16} />}>Trust</Button>
                    </Link>
                    <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text">Service Tiers</Button>
                    </Link>
                    <Link href="/resources" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text">Resources</Button>
                    </Link>
                    <Link href="/catalog" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text">Catalog</Button>
                    </Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                        <Button block type="text">Contact</Button>
                    </Link>
                    <div className="mobile-divider" />
                    {user ? (
                        <>
                            <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                                <Button block icon={<DashboardOutlined />}>{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</Button>
                            </Link>
                            <Button block danger icon={<LogoutOutlined />} onClick={() => { logout(); setMobileMenuOpen(false); }}>
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <Link href="/publish" onClick={() => setMobileMenuOpen(false)}>
                            <Button block type="primary">Start Submission</Button>
                        </Link>
                    )}
                </div>
            </Drawer>
        </nav>
    );
};
