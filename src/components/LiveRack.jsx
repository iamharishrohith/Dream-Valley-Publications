'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { Tag } from 'antd';
import { StarFilled, BookOutlined, FileTextOutlined } from '@ant-design/icons';

const LiveRack = ({ items = [], title = 'Library Rack', type = 'book' }) => {
    const router = useRouter();
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const displayItems = items.slice(0, 12);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', checkScroll, { passive: true });
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [displayItems]);

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };

    if (displayItems.length === 0) return null;

    return (
        <div className="carousel-section">
            <div className="carousel-header">
                <div>
                    <h3 className="carousel-title">{title}</h3>
                    <p className="carousel-subtitle">Scroll to explore • Click to view details</p>
                </div>
                <div className="carousel-nav">
                    <button
                        className={`carousel-btn ${!canScrollLeft ? 'carousel-btn-disabled' : ''}`}
                        onClick={() => scroll(-1)}
                        disabled={!canScrollLeft}
                        aria-label="Scroll left"
                    >
                        ←
                    </button>
                    <button
                        className={`carousel-btn ${!canScrollRight ? 'carousel-btn-disabled' : ''}`}
                        onClick={() => scroll(1)}
                        disabled={!canScrollRight}
                        aria-label="Scroll right"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="carousel-track-wrapper">
                {canScrollLeft && <div className="carousel-fade carousel-fade-left" />}
                {canScrollRight && <div className="carousel-fade carousel-fade-right" />}

                <div ref={scrollRef} className="carousel-track">
                    {displayItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className="carousel-card"
                            onClick={() => router.push(`/book/${item.id}`)}
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <div className="carousel-card-cover">
                                {item.cover ? (
                                    <img src={item.cover} alt={item.title} loading="lazy" />
                                ) : (
                                    <div className="carousel-card-placeholder">
                                        {type === 'journal' ? (
                                            <FileTextOutlined style={{ fontSize: 40, color: 'var(--color-secondary)' }} />
                                        ) : (
                                            <BookOutlined style={{ fontSize: 40, color: 'var(--color-primary)' }} />
                                        )}
                                    </div>
                                )}
                                <div className="carousel-card-overlay">
                                    <span className="carousel-card-view">View Details →</span>
                                </div>
                                <div className="carousel-card-tag">
                                    <Tag color={type === 'journal' ? 'purple' : 'blue'} style={{ margin: 0, fontSize: 10 }}>
                                        {type === 'journal' ? 'Journal' : 'Book'}
                                    </Tag>
                                </div>
                            </div>
                            <div className="carousel-card-info">
                                <h4 className="carousel-card-title">{item.title}</h4>
                                <p className="carousel-card-author">{item.author}</p>
                                <div className="carousel-card-meta">
                                    <span className="carousel-card-rating"><StarFilled /> 4.8</span>
                                    <span className="carousel-card-isbn">{item.isbn ? `#${item.isbn.slice(-4)}` : 'NEW'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveRack;
