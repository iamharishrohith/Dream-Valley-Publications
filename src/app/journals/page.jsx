'use client';

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, Tag, Spin, Empty, Input, Button } from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Journals() {
    const { books, loading } = useStore();
    const router = useRouter();
    const [search, setSearch] = useState('');

    const publishedJournals = books
        .filter((book) => book.type === 'journal')
        .filter((book) =>
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            (book.author || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Journal publishing and discoverability</p>
                <h1 className="premium-title">Browse public journal outputs and prepare future academic submissions</h1>
                <p className="premium-copy">
                    This catalog presents the public journal-facing side of the platform while the deeper editorial workflow continues to mature. It is intended for researchers, departments, and proceedings stakeholders.
                </p>
                <Link href="/academics">
                    <Button type="primary" size="large">Explore academic publishing</Button>
                </Link>
            </section>

            <div className="list-header">
                <div>
                    <h2 className="text-2xl font-bold text-slate">Open Journals</h2>
                    <p className="text-gray mt-1">Public-facing academic outputs and research-oriented publication records.</p>
                </div>
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search journals by title or author..."
                    style={{ maxWidth: 360, width: '100%' }}
                    size="large"
                    allowClear
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spin size="large" /></div>
            ) : publishedJournals.length === 0 ? (
                <Empty description="No journals found." />
            ) : (
                <div className="journal-grid">
                    {publishedJournals.map((journal) => (
                        <div key={journal.id} className="cursor-pointer" onClick={() => router.push(`/book/${journal.id}`)}>
                            <Card hoverable style={{ transition: 'all 200ms ease' }} className="premium-card">
                                <div className="journal-card-inner">
                                    <div className="journal-icon-box">
                                        <FileTextOutlined style={{ fontSize: '32px' }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="journal-header">
                                            <h3 className="text-lg font-bold text-slate line-clamp-2">{journal.title}</h3>
                                            <Tag color="purple">Journal</Tag>
                                        </div>
                                        <p className="text-sm text-gray mt-1">{journal.author}</p>
                                        <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                                            {journal.description}
                                        </p>
                                        <div className="mt-3 text-xs text-muted">
                                            Published: {new Date(journal.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
