'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useEffect, useState } from 'react';
import { Button, Tag, Spin, Result } from 'antd';
import { ArrowLeftOutlined, ReadOutlined } from '@ant-design/icons';

export default function BookDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { getBookById } = useStore();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            const data = await getBookById(id);
            setBook(data);
            setLoading(false);
        };
        fetchBook();
    }, [id, getBookById]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;
    if (!book) return <Result status="404" title="Content Not Found" subTitle="The book or journal you are looking for does not exist." extra={<Button type="primary" onClick={() => router.push('/')}>Back Home</Button>} />;

    const isJournal = book.type === 'journal';

    const bookJsonLd = {
        '@context': 'https://schema.org',
        '@type': isJournal ? 'ScholarlyArticle' : 'Book',
        name: book.title,
        headline: book.title,
        author: { '@type': 'Person', name: book.author },
        isbn: book.isbn || undefined,
        publisher: { '@type': 'Organization', name: 'Dream Valley Publications' },
        image: book.cover || undefined,
        description: book.description,
        inLanguage: book.language || 'English',
        datePublished: book.created_at,
        numberOfPages: book.pages || undefined,
        genre: book.category || 'Academic',
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dreamvalleypublications.com' },
            { '@type': 'ListItem', position: 2, name: isJournal ? 'Journals' : 'Books', item: `https://dreamvalleypublications.com/${isJournal ? 'journals' : 'books'}` },
            { '@type': 'ListItem', position: 3, name: book.title },
        ],
    };

    return (
        <main className="page-wrapper container" style={{ maxWidth: '72rem' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="/" style={{ color: 'var(--color-primary)' }}>Home</a></li>
                    <li>/</li>
                    <li><a href={isJournal ? '/journals' : '/books'} style={{ color: 'var(--color-primary)' }}>{isJournal ? 'Journals' : 'Books'}</a></li>
                    <li>/</li>
                    <li aria-current="page" style={{ color: 'var(--color-text-secondary)' }}>{book.title}</li>
                </ol>
            </nav>

            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} className="mb-6">Back</Button>

            <article className="detail-grid" itemScope itemType={`https://schema.org/${isJournal ? 'ScholarlyArticle' : 'Book'}`}>
                <div>
                    <div className="detail-cover">
                        {isJournal ? (
                            <div className="p-8 text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)', fontWeight: 700 }}>DOC</div>
                                <div className="text-muted font-bold">Research Paper</div>
                            </div>
                        ) : book.cover ? (
                            <img src={book.cover} alt={book.title} loading="lazy" itemProp="image" />
                        ) : (
                            <div className="p-8 text-center">
                                <div className="text-muted font-bold">Cover image coming soon</div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div>
                        <div className="flex gap-2 mb-4">
                            <Tag color="blue">Published</Tag>
                            <Tag color="green">#{book.isbn}</Tag>
                            {isJournal && <Tag color="purple">Research Journal</Tag>}
                        </div>
                        <h1 className="text-3xl font-bold text-slate leading-tight mb-2" style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }} itemProp="name">{book.title}</h1>
                        <p className="text-xl text-primary font-medium" itemProp="author">{book.author}</p>
                    </div>

                    <div className="detail-meta-grid">
                        <div>
                            <div className="detail-meta-label">{isJournal ? 'Ref ID' : 'ISBN'}</div>
                            <div className="font-mono font-medium" itemProp="isbn">{book.isbn || 'Pending'}</div>
                        </div>
                        <div>
                            <div className="detail-meta-label">Published Date</div>
                            <div className="font-medium" itemProp="datePublished">{new Date(book.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-3">Abstract</h2>
                        <p className="text-gray leading-relaxed text-lg" itemProp="description">{book.description}</p>
                    </div>

                    <div className="flex gap-4" style={{ paddingTop: 'var(--space-4)' }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ReadOutlined />}
                            style={{ height: 48, padding: '0 32px' }}
                            disabled={!book.document_url}
                            href={book.document_url || undefined}
                            target={book.document_url ? '_blank' : undefined}
                        >
                            {book.document_url ? 'Open Publication File' : 'File Available on Request'}
                        </Button>
                    </div>
                </div>
            </article>
        </main>
    );
}
