'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Empty, Tag } from 'antd';
import { ArrowRightOutlined, SafetyCertificateOutlined, TeamOutlined, ProfileOutlined, ReadOutlined, RocketOutlined, AuditOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import Newsletter from '@/components/Newsletter';
import BlurImage from '@/components/BlurImage';
import Reveal from '@/components/Reveal';
import useScrollReveal from '@/hooks/useScrollReveal';
import { useTheme } from '@/context/ThemeContext';
import { FAQS, SERVICE_LANES, TRUST_PILLARS } from '@/lib/site';

export default function Home() {
    const { books, loading } = useStore();
    const { theme } = useTheme();
    const router = useRouter();

    useScrollReveal();

    const featuredBooks = books.slice(0, 6);
    const isDark = theme === 'dark';
    const heroLogoSrc = isDark ? '/Assets/new_dark-logo-bgrmrv.png' : '/Assets/new-white-logo-bgrmrv.png';
    const heroLogoWidth = isDark ? 236 : 520;
    const heroLogoHeight = isDark ? 236 : 110;
    const heroHighlights = [
        {
            icon: <AuditOutlined />,
            title: 'Guided intake',
            detail: 'Structured submission',
        },
        {
            icon: <SafetyCertificateOutlined />,
            title: 'Protected workflow',
            detail: 'Author + admin visibility',
        },
        {
            icon: <RocketOutlined />,
            title: 'Launch-ready presentation',
            detail: 'Books, journals, proceedings',
        },
    ];

    return (
        <div className="page-wrapper container">
            <section className="hero hero-premium">
                <div className="hero-editorial-bg" aria-hidden="true" />

                <div className="hero-masthead hero-masthead-split">
                    <div className="hero-brand-column">
                        <div className="hero-wordmark-wrap">
                            <Image
                                src={heroLogoSrc}
                                alt="Dream Valley Publications"
                                width={heroLogoWidth}
                                height={heroLogoHeight}
                                priority
                                className="hero-wordmark"
                            />
                        </div>
                        <div className="hero-brand-caption">
                            <p className="hero-brand-eyebrow">Dream Valley Publications</p>
                            <p className="hero-brand-support">Boutique publishing for books, journals, theses, and institutional work.</p>
                        </div>
                    </div>

                    <div className="hero-content-column">
                        <div className="hero-kicker-row">
                            <ReadOutlined className="hero-kicker-icon" />
                            <p className="premium-kicker">Premium academic and author publishing</p>
                        </div>
                        <h1 className="hero-title">Premium publishing for authors and academics.</h1>
                        <p className="hero-subtitle">
                            Dream Valley Publications helps researchers, institutions, and expert authors move from submission to publication
                            with guided intake, protected workflows, and premium presentation.
                        </p>

                        <div className="hero-actions">
                            <Link href="/publish">
                                <Button type="primary" size="large" shape="round" className="ripple-btn">
                                    Start Submission
                                </Button>
                            </Link>
                            <Link href="/services">
                                <Button size="large" shape="round" icon={<ArrowRightOutlined />}>
                                    Explore Services
                                </Button>
                            </Link>
                        </div>

                        <div className="hero-lane-grid" aria-label="Publishing platform highlights">
                            {heroHighlights.map((item) => (
                                <article key={item.title} className="hero-lane-card">
                                    <span className="hero-lane-icon" aria-hidden="true">{item.icon}</span>
                                    <p className="hero-lane-title">{item.title}</p>
                                    <p className="hero-lane-detail">{item.detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hero-trust-strip" aria-label="Publishing trust highlights">
                    <span>Guided editorial intake</span>
                    <span>Author dashboard</span>
                    <span>Protected admin workflow</span>
                    <span>Submission tracking</span>
                </div>
            </section>

            <Reveal width="100%">
                <section className="premium-grid premium-grid-two" style={{ marginBottom: 'var(--space-20)' }}>
                    {SERVICE_LANES.map((lane) => (
                        <Card key={lane.id} className="premium-card" variant="borderless">
                            <p className="premium-label">{lane.title}</p>
                            <h2 className="premium-card-title">{lane.subtitle}</h2>
                            <ul className="premium-list">
                                {lane.features.map((feature) => (
                                    <li key={feature}>{feature}</li>
                                ))}
                            </ul>
                            <Link href={lane.cta}>
                                <Button type="primary">Start this lane</Button>
                            </Link>
                        </Card>
                    ))}
                </section>
            </Reveal>

            <Reveal width="100%">
                <section className="premium-section-block">
                    <div className="section-header">
                        <h2 className="section-title">Why serious authors choose trust over noise</h2>
                        <p className="section-subtitle">The website now emphasizes premium process clarity over speculative claims or demo-grade signals.</p>
                    </div>
                    <div className="premium-grid premium-grid-three">
                        {TRUST_PILLARS.map((pillar, index) => {
                            const icons = [<SafetyCertificateOutlined key="s" />, <ProfileOutlined key="p" />, <TeamOutlined key="t" />];
                            return (
                                <Card key={pillar.title} className="premium-card feature-card" variant="borderless">
                                    <div className="feature-icon">{icons[index]}</div>
                                    <h3 className="premium-card-title">{pillar.title}</h3>
                                    <p className="text-gray">{pillar.description}</p>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            </Reveal>

            <Reveal width="100%">
                <section className="premium-callout">
                    <div className="list-header">
                        <div>
                            <h2 className="section-title">Search the published catalog</h2>
                            <p className="section-subtitle">Browse the public-facing library while the new submission and editorial workflow matures.</p>
                        </div>
                        <SearchAutocomplete placeholder="Search by title, author, or ISBN" style={{ maxWidth: 360, width: '100%' }} />
                    </div>
                    {loading ? (
                        <p className="text-gray">Loading published titles...</p>
                    ) : featuredBooks.length === 0 ? (
                        <Empty description="Published titles will appear here as the catalog grows." />
                    ) : (
                        <div className="book-grid">
                            {featuredBooks.map((book) => (
                                <div key={book.id} className="book-card tilt-card reveal" onClick={() => router.push(`/book/${book.id}`)}>
                                    <Card
                                        hoverable
                                        className="glass-panel"
                                        cover={
                                            <div className="book-cover">
                                                {book.cover ? (
                                                    <BlurImage src={book.cover} alt={book.title} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)' }} />
                                                )}
                                                <div className="book-cover-tag">
                                                    <Tag color={book.type === 'journal' ? 'purple' : 'blue'}>
                                                        {book.type === 'journal' ? 'Journal' : 'Book'}
                                                    </Tag>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="book-title">{book.title}</div>
                                        <div className="book-author">{book.author}</div>
                                        <p className="text-sm text-gray mt-2 line-clamp-2">{book.description}</p>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </Reveal>

            <Newsletter />

            <Reveal width="100%">
                <section aria-label="Frequently Asked Questions" className="premium-section-block">
                    <h2 className="section-title text-center">Direct answers for authors and institutions</h2>
                    <div className="premium-faq-list">
                        {FAQS.map((faq) => (
                            <details key={faq.question} className="glass-panel premium-faq-item">
                                <summary>{faq.question}</summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </Reveal>
        </div>
    );
}
