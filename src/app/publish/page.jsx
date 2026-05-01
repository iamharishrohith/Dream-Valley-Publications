'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Result, Tabs, Button, Steps, Upload } from 'antd';
import { FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import gsap from 'gsap';
import { RequestForm } from '@/components/RequestForm';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/telemetry';

export default function Publish() {
    const { publishBook } = useStore();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successMode, setSuccessMode] = useState(false);
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('lane') === 'academic' ? 'journal' : 'book');
    const [fileList, setFileList] = useState([]);
    const [coverFileList, setCoverFileList] = useState([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' });
        });
        return () => ctx.revert();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            let documentUpload = null;
            let coverUpload = null;

            if (fileList.length > 0) {
                documentUpload = await api.uploadDocument(fileList[0], 'dvp/submissions');
            }

            if (coverFileList.length > 0) {
                coverUpload = await api.uploadImage(coverFileList[0], 'dvp/covers');
            }

            const payload = {
                ...values,
                type: activeTab,
                ownerEmail: user?.email || values.email,
                cover: coverUpload?.url || null,
                cover_thumb: coverUpload?.thumbnail || null,
                cover_blur: coverUpload?.blurUrl || null,
                cover_public_id: coverUpload?.publicId || null,
                document_url: documentUpload?.url || null,
                document_public_id: documentUpload?.publicId || null,
                fileName: fileList.length > 0 ? fileList[0].name : null,
                fileSize: fileList.length > 0 ? `${(fileList[0].size / 1024 / 1024).toFixed(2)} MB` : null,
            };

            const created = await publishBook(payload);
            if (created) {
                trackEvent('submission_created', { lane: values.lane, type: activeTab, hasAccount: !!user });
                setSuccessMode(true);
                setFileList([]);
                setCoverFileList([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        fileList,
        onRemove: () => setFileList([]),
        beforeUpload: (file) => {
            const valid = file.size / 1024 / 1024 < 50;
            if (!valid) {
                toast.error('Manuscript must be smaller than 50MB');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            return false;
        },
    };

    const coverUploadProps = {
        name: 'cover',
        multiple: false,
        listType: 'picture',
        fileList: coverFileList,
        onRemove: () => setCoverFileList([]),
        beforeUpload: (file) => {
            const valid = file.size / 1024 / 1024 < 5;
            if (!valid) {
                toast.error('Cover image must be smaller than 5MB');
                return Upload.LIST_IGNORE;
            }
            setCoverFileList([file]);
            return false;
        },
    };

    const Guidelines = () => (
        <div className="guidelines-box">
            <h4 className="guidelines-title">
                <FileTextOutlined /> Premium submission guidance
            </h4>
            <div className="guidelines-content">
                <div className="flex-1">
                    <ul className="guidelines-list">
                        <li>Upload a complete manuscript in PDF or DOCX format.</li>
                        <li>Provide a concise abstract or project summary.</li>
                        <li>Use the correct publishing lane to speed up editorial qualification.</li>
                        <li>Include institution or brand details when they influence the publishing context.</li>
                        <li>After submission, the project enters an editorial intake workflow rather than instant publication.</li>
                    </ul>
                </div>
                <div className="guidelines-preview">
                    <p className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted">Submission preview</p>
                    <div className="guidelines-preview-thumb">
                        <img
                            src="/Assets/new-white-logo-bgrmrv.png"
                            alt="Dream Valley Publications submission preview"
                            width={100}
                            height={100}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    if (successMode) {
        return (
            <div className="page-wrapper flex items-center justify-center">
                <Card style={{ maxWidth: '32rem', width: '100%', borderTop: '4px solid var(--color-success)' }} className="shadow-lg">
                    <Result
                        status="success"
                        title="Submission Received"
                        subTitle="Your files and metadata have been sent into editorial intake. The team can now review the project with the correct publishing lane and supporting details."
                        extra={[
                            <Button type="primary" key="home" onClick={() => router.push('/')}>Back Home</Button>,
                            <Button key="again" onClick={() => setSuccessMode(false)}>Submit Another</Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="page-wrapper relative overflow-hidden bg-gray-50" style={{ paddingBottom: 'var(--space-20)' }}>
            <div className="publish-bg">
                <div className="publish-blob publish-blob-1" />
                <div className="publish-blob publish-blob-2" />
            </div>

            <div ref={containerRef} className="container" style={{ maxWidth: '72rem', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
                <Card className="card-glass shadow-xl rounded-2xl overflow-hidden">
                    <div className="mb-8 text-center border-b pb-6" style={{ borderColor: 'var(--color-border-light)' }}>
                        <h1 className="text-3xl font-extrabold mb-3 text-slate tracking-tight">Premium Submission Intake</h1>
                        <p className="text-gray" style={{ maxWidth: '38rem', margin: '0 auto' }}>
                            Use the right lane, upload real files, and send complete metadata so the editorial team can assess fit quickly and accurately.
                        </p>
                    </div>

                    <div className="publish-steps-wrap">
                        <Steps
                            className="mb-8"
                            responsive
                            items={[
                                { title: 'Choose lane', description: 'Academic or author publishing' },
                                { title: 'Add files', description: 'Upload manuscript and optional cover' },
                                { title: 'Editorial intake', description: 'Team qualification and follow-up' },
                            ]}
                        />
                    </div>

                    <div className="px-2">
                        <Guidelines />
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            type="card"
                            size="large"
                            items={[
                                {
                                    label: 'Author Publishing',
                                    key: 'book',
                                    children: <RequestForm type="book" onFinish={onFinish} loading={loading} uploadProps={uploadProps} coverUploadProps={coverUploadProps} initialLane="author" />,
                                },
                                {
                                    label: 'Academic Publishing',
                                    key: 'journal',
                                    children: <RequestForm type="journal" onFinish={onFinish} loading={loading} uploadProps={uploadProps} coverUploadProps={coverUploadProps} initialLane="academic" />,
                                },
                            ]}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
