'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Table, Tag, Result, Button, Spin, Descriptions } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function DashboardPage() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user || isAdmin) {
                setFetching(false);
                return;
            }
            try {
                const data = await api.getMySubmissions();
                setItems(Array.isArray(data) ? data : []);
            } finally {
                setFetching(false);
            }
        };

        if (!loading) load();
    }, [user, loading, isAdmin]);

    if (loading || fetching) {
        return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Result
                    status="403"
                    title="Sign in required"
                    subTitle="Create or sign in to an author account to track your submissions."
                    extra={<Button type="primary" onClick={() => router.push('/login')}>Go to Login</Button>}
                />
            </div>
        );
    }

    if (isAdmin) {
        router.push('/admin');
        return null;
    }

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Lane', dataIndex: 'lane', key: 'lane', render: (lane) => <Tag color={lane === 'academic' ? 'purple' : 'blue'}>{lane || 'author'}</Tag> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'Published' ? 'green' : 'orange'}>{status}</Tag> },
        { title: 'Timeline', dataIndex: 'timeline', key: 'timeline' },
        { title: 'Submitted', dataIndex: 'created_at', key: 'created_at', render: (value) => new Date(value).toLocaleDateString() },
    ];

    return (
        <div className="page-wrapper container">
            <div className="premium-hero-block" style={{ marginBottom: 'var(--space-10)' }}>
                <p className="premium-kicker">Author dashboard</p>
                <h1 className="premium-title">Track your submissions and publishing status</h1>
                <p className="premium-copy">
                    This dashboard gives authors a cleaner way to follow submission intake and understand which publishing lane and workflow stage each project is currently in.
                </p>
            </div>

            <Card className="premium-card" variant="borderless" style={{ marginBottom: 'var(--space-8)' }}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Account">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
                    <Descriptions.Item label="Dashboard Scope">Owned submissions associated with this account email</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card className="premium-card" variant="borderless">
                <Table
                    dataSource={items}
                    columns={columns}
                    rowKey="id"
                    locale={{ emptyText: 'No submissions are linked to this account yet.' }}
                />
            </Card>
        </div>
    );
}
