'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, Tag, Empty } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import LiveRack from '@/components/LiveRack';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import BlurImage from '@/components/BlurImage';
import useScrollReveal from '@/hooks/useScrollReveal';

const CATEGORIES = ['All', 'Physics', 'Computer Science', 'Biology', 'Economics', 'Engineering', 'Mathematics'];
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

export default function Books() {
    const { books, loading } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState('All');

    useScrollReveal();

    const publishedBooks = useMemo(() => {
        let filtered = books.filter(b => b.status === 'Published' && b.type === 'book');
        if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(lower) ||
                (b.isbn && String(b.isbn).includes(search))
            );
        }
        if (activeCategory !== 'All') {
            filtered = filtered.filter(b =>
                b.category?.toLowerCase() === activeCategory.toLowerCase() ||
                b.title.toLowerCase().includes(activeCategory.toLowerCase())
            );
        }
        return filtered;
    }, [books, search, activeCategory]);

    return (
        <div className="page-wrapper container">
            <div className="list-header reveal">
                <div>
                    <h2 className="text-2xl font-bold text-slate">Books Collection</h2>
                    <p className="text-gray mt-1">Explore our latest published books</p>
                </div>
                <SearchAutocomplete
                    placeholder="Search Books..."
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

            {!loading && publishedBooks.length > 0 && (
                <LiveRack items={publishedBooks} title="New Arrivals" type="book" />
            )}

            {loading ? (
                <div className="book-grid">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : publishedBooks.length === 0 ? (
                <Empty description="No books found." />
            ) : (
                <div className="book-grid">
                    {publishedBooks.map((book) => (
                        <div key={book.id} className="book-card tilt-card reveal" onClick={() => router.push(`/book/${book.id}`)}>
                            <Card
                                hoverable
                                style={{ height: '100%', overflow: 'hidden' }}
                                cover={
                                    <div className="book-cover">
                                        {book.cover ? (
                                            <BlurImage src={book.cover} alt={book.title} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)' }} />
                                        )}
                                        <div className="book-cover-tag">
                                            <Tag color="blue">Book</Tag>
                                        </div>
                                    </div>
                                }
                            >
                                <Meta
                                    title={<div className="book-title">{book.title}</div>}
                                    description={
                                        <div className="mt-2">
                                            <div className="book-author">{book.author}</div>
                                            <div className="book-meta">
                                                <span className="book-details-badge">{book.category || 'Publication'}</span>
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
