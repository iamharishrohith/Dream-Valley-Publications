'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, Tag, Empty } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import LiveRack from '@/components/LiveRack';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import BlurImage from '@/components/BlurImage';
import useScrollReveal from '@/hooks/useScrollReveal';

const CATEGORIES = ['All', 'Books', 'Journals', 'Scopus', 'Physics', 'Computer Science', 'Biology', 'Economics', 'Engineering', 'Mathematics'];
const { Meta } = Card;

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-img" />
        <div style={{ padding: 'var(--space-4)' }}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text-short" />
        </div>
    </div>
);

export default function Catalog() {
    const { books, loading } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState('All');

    useScrollReveal();

    const publishedItems = useMemo(() => {
        let filtered = books.filter(b => b.status === 'Published');
        if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(lower) ||
                (b.isbn && String(b.isbn).includes(search))
            );
        }
        if (activeCategory !== 'All') {
            if (['Books', 'Journals'].includes(activeCategory)) {
                const typeVal = activeCategory === 'Books' ? 'book' : 'journal';
                filtered = filtered.filter(b => b.type === typeVal);
            } else if (activeCategory === 'Scopus') {
                filtered = filtered.filter(b => b.genre?.toLowerCase() === 'scopus' || b.category?.toLowerCase() === 'scopus');
            } else {
                filtered = filtered.filter(b =>
                    b.category?.toLowerCase() === activeCategory.toLowerCase() ||
                    b.title.toLowerCase().includes(activeCategory.toLowerCase()) ||
                    b.genre?.toLowerCase() === activeCategory.toLowerCase()
                );
            }
        }
        return filtered;
    }, [books, search, activeCategory]);

    return (
        <div className="page-wrapper container">
            <div className="list-header reveal">
                <div>
                    <h2 className="text-2xl font-bold text-slate">Catalog</h2>
                    <p className="text-gray mt-1">Explore our latest published books, journals, and Scopus outputs</p>
                </div>
                <SearchAutocomplete
                    placeholder="Search Catalog..."
                    style={{ maxWidth: 320, width: '100%' }}
                    value={search}
                    onQueryChange={setSearch}
                />
            </div>

            {/* Category Filters */}
            <div className="filter-tags reveal">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`filter-tag ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {!loading && publishedItems.length > 0 && (
                <LiveRack items={publishedItems.filter(i => i.type === 'book')} title="New Arrivals" type="book" />
            )}

            {loading ? (
                <div className="book-grid">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : publishedItems.length === 0 ? (
                <Empty description="No catalog items found." />
            ) : (
                <div className="book-grid mt-6">
                    {publishedItems.map((item) => (
                        <div key={item.id} className="book-card tilt-card reveal" onClick={() => router.push(`/book/${item.id}`)}>
                            <Card
                                hoverable
                                style={{ height: '100%', overflow: 'hidden' }}
                                cover={
                                    <div className="book-cover">
                                        {item.cover ? (
                                            <BlurImage src={item.cover} alt={item.title} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)' }} />
                                        )}
                                        <div className="book-cover-tag">
                                            <Tag color={item.type === 'journal' ? 'purple' : 'blue'}>
                                                {item.type === 'journal' ? 'Journal' : 'Book'}
                                            </Tag>
                                        </div>
                                    </div>
                                }
                            >
                                <Meta
                                    title={<div className="book-title">{item.title}</div>}
                                    description={
                                        <div className="mt-2">
                                            <div className="book-author">{item.author}</div>
                                            <div className="book-meta mt-1">
                                                <span className="book-details-badge">{item.genre || item.category || 'Publication'}</span>
                                                {item.isbn && <span className="book-details-badge" style={{ marginLeft: '8px' }}>ISBN: {item.isbn}</span>}
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
