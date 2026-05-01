'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, Table, Tag, Button, Input, Tabs, Badge, Space, Modal, message, Result, Spin, Tooltip, Descriptions } from 'antd';
import { CheckOutlined, DeleteOutlined, SearchOutlined, LockOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function Admin() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [auditItems, setAuditItems] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [viewRecord, setViewRecord] = useState(null);

    const loadAdminItems = async () => {
        try {
            setLoading(true);
            const [data, audit, metricPayload] = await Promise.all([
                api.getAdminSubmissions(),
                api.getAuditLog(),
                api.getAdminMetrics(),
            ]);
            setItems(Array.isArray(data) ? data : []);
            setAuditItems(Array.isArray(audit) ? audit : []);
            setMetrics(metricPayload || null);
        } catch (error) {
            message.error(error.message || 'Failed to load admin workflow');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && isAdmin) {
            loadAdminItems();
        } else {
            setLoading(false);
        }
    }, [user, isAdmin]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Result
                    status="403"
                    icon={<LockOutlined />}
                    title="Admin Access Required"
                    subTitle="This workflow is now server-protected and available only to approved editorial accounts."
                    extra={<Button type="primary" onClick={() => router.push('/login')}>Go to Login</Button>}
                />
            </div>
        );
    }

    const filteredItems = items.filter((item) => {
        const haystack = `${item.title} ${item.author} ${item.email} ${item.institution || ''}`.toLowerCase();
        return haystack.includes(searchText.toLowerCase());
    });

    const handleApprove = (record) => {
        let identifier = record.isbn || '';
        Modal.confirm({
            title: 'Approve for publication',
            content: (
                <div>
                    <p>Assign a publication identifier or ISBN:</p>
                    <Input
                        placeholder="Identifier..."
                        onChange={(event) => { identifier = event.target.value; }}
                        defaultValue={record.isbn || ''}
                    />
                </div>
            ),
            onOk: async () => {
                if (!identifier) return message.error('Identifier required');
                await api.updateSubmission(record.id, {
                    ...record,
                    status: 'Published',
                    isbn: identifier,
                });
                message.success('Submission published');
                loadAdminItems();
            },
        });
    };

    const handleDelete = async (record) => {
        await api.deleteSubmission(record.id);
        message.success('Submission deleted');
        loadAdminItems();
    };

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Author', dataIndex: 'author', key: 'author' },
        { title: 'Lane', dataIndex: 'lane', key: 'lane', render: (lane) => <Tag color={lane === 'academic' ? 'purple' : 'blue'}>{lane || 'author'}</Tag> },
        { title: 'Tier', dataIndex: 'service_tier', key: 'service_tier', render: (tier) => <Tag>{tier || 'guided'}</Tag> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'Published' ? 'green' : 'orange'}>{status?.toUpperCase()}</Tag> },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details"><Button size="small" icon={<EyeOutlined />} onClick={() => setViewRecord(record)} /></Tooltip>
                    {record.status === 'Pending' && <Tooltip title="Approve"><Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)} /></Tooltip>}
                    <Tooltip title="Delete"><Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} /></Tooltip>
                </Space>
            ),
        },
    ];

    const auditColumns = [
        { title: 'When', dataIndex: 'created_at', key: 'created_at', render: (value) => new Date(value).toLocaleString() },
        { title: 'Actor', dataIndex: 'actor_email', key: 'actor_email', render: (value) => value || 'system' },
        { title: 'Action', dataIndex: 'action', key: 'action' },
        { title: 'Entity', dataIndex: 'entity_id', key: 'entity_id', render: (value) => value || 'n/a' },
    ];

    return (
        <div className="page-wrapper container">
            <div className="admin-header">
                <div>
                    <h1 className="text-2xl font-bold">Editorial Workflow Dashboard</h1>
                    <p className="text-gray">Protected intake, review, and publishing workflow for approved admin accounts.</p>
                </div>
                <Input prefix={<SearchOutlined />} placeholder="Search title, author, email, institution..." style={{ width: 320 }} onChange={(event) => setSearchText(event.target.value)} />
            </div>
            {metrics && (
                <div className="premium-grid premium-grid-three" style={{ marginBottom: 'var(--space-6)' }}>
                    <Card className="premium-card" variant="borderless">
                        <div className="premium-label">Catalog</div>
                        <div className="premium-card-title" style={{ marginBottom: 8 }}>{metrics.published} published</div>
                        <p className="text-gray">Public-facing records currently live in the catalog.</p>
                    </Card>
                    <Card className="premium-card" variant="borderless">
                        <div className="premium-label">Pipeline</div>
                        <div className="premium-card-title" style={{ marginBottom: 8 }}>{metrics.pending} pending</div>
                        <p className="text-gray">Items still in editorial intake or publication review.</p>
                    </Card>
                    <Card className="premium-card" variant="borderless">
                        <div className="premium-label">Audience</div>
                        <div className="premium-card-title" style={{ marginBottom: 8 }}>{metrics.authors} authors</div>
                        <p className="text-gray">{metrics.leads} leads and {metrics.subscribers} newsletter subscribers captured.</p>
                    </Card>
                </div>
            )}
            <Card className="shadow-soft rounded-xl border-none">
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: '1',
                            label: <Badge count={filteredItems.filter((item) => item.status === 'Pending').length} offset={[10, 0]} color="orange">Pending Intake</Badge>,
                            children: <Table dataSource={filteredItems.filter((item) => item.status === 'Pending')} columns={columns} loading={loading} rowKey="id" />,
                        },
                        {
                            key: '2',
                            label: 'Published Library',
                            children: <Table dataSource={filteredItems.filter((item) => item.status === 'Published')} columns={columns} loading={loading} rowKey="id" />,
                        },
                        {
                            key: '3',
                            label: 'Audit Trail',
                            children: <Table dataSource={auditItems} columns={auditColumns} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} />,
                        },
                    ]}
                />
            </Card>

            <Modal
                title="Submission Details"
                open={!!viewRecord}
                onCancel={() => setViewRecord(null)}
                footer={[<Button key="close" onClick={() => setViewRecord(null)}>Close</Button>]}
            >
                {viewRecord && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Title">{viewRecord.title}</Descriptions.Item>
                        <Descriptions.Item label="Author">{viewRecord.author}</Descriptions.Item>
                        <Descriptions.Item label="Email">{viewRecord.email}</Descriptions.Item>
                        <Descriptions.Item label="WhatsApp">{viewRecord.whatsapp}</Descriptions.Item>
                        <Descriptions.Item label="Alt Phone">{viewRecord.phone}</Descriptions.Item>
                        <Descriptions.Item label="Institution">{viewRecord.institution || 'Not provided'}</Descriptions.Item>
                        <Descriptions.Item label="Lane">{viewRecord.lane || 'author'}</Descriptions.Item>
                        <Descriptions.Item label="Tier">{viewRecord.service_tier || 'guided'}</Descriptions.Item>
                        <Descriptions.Item label="Timeline">{viewRecord.timeline || 'Flexible'}</Descriptions.Item>
                        <Descriptions.Item label="Region">{viewRecord.region || 'Not provided'}</Descriptions.Item>
                        <Descriptions.Item label="Abstract">{viewRecord.description}</Descriptions.Item>
                        <Descriptions.Item label="File Name">{viewRecord.fileName || 'Not provided'}</Descriptions.Item>
                        <Descriptions.Item label="File Size">{viewRecord.fileSize || 'Not provided'}</Descriptions.Item>
                        <Descriptions.Item label="Document URL">{viewRecord.document_url || 'Not uploaded'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}
