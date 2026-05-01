'use client';

import { Form, Input, Button, Upload, Select, Checkbox } from 'antd';
import {
    InboxOutlined,
    UserOutlined,
    BookOutlined,
    CloudUploadOutlined,
    PhoneOutlined,
    MailOutlined,
    WhatsAppOutlined,
    BankOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Dragger } = Upload;
const { TextArea } = Input;

export const RequestForm = ({ type, onFinish, loading, uploadProps, coverUploadProps, initialLane }) => {
    const router = useRouter();

    return (
        <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            requiredMark="optional"
            initialValues={{
                lane: initialLane || (type === 'journal' ? 'academic' : 'author'),
                serviceTier: 'guided',
                timeline: 'Flexible',
            }}
        >
            <div className="form-grid">
                <div className="form-section">
                    <h3 className="form-section-title">Contact and profile</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Form.Item name="author" label={<span className="font-medium text-slate">Full Name</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Full name" />
                        </Form.Item>
                        <Form.Item name="email" label={<span className="font-medium text-slate">Email</span>} rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Email address" />
                        </Form.Item>
                        <div className="grid grid-2 gap-4">
                            <Form.Item name="whatsapp" label={<span className="font-medium text-slate">WhatsApp</span>} rules={[{ required: true, message: 'Required' }]}>
                                <Input prefix={<WhatsAppOutlined style={{ color: '#94a3b8' }} />} placeholder="WhatsApp number" />
                            </Form.Item>
                            <Form.Item name="phone" label={<span className="font-medium text-slate">Alt Phone</span>} rules={[{ required: true }]}>
                                <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="Alternative phone" />
                            </Form.Item>
                        </div>
                        <Form.Item name="institution" label={<span className="font-medium text-slate">Institution / Organization</span>}>
                            <Input prefix={<BankOutlined style={{ color: '#94a3b8' }} />} placeholder="Organization or affiliation" />
                        </Form.Item>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="form-section-title">Submission and workflow</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="grid grid-2 gap-4">
                            <Form.Item name="lane" label={<span className="font-medium text-slate">Publishing Lane</span>} rules={[{ required: true }]}>
                                <Select
                                    options={[
                                        { value: 'academic', label: 'Academic Publishing' },
                                        { value: 'author', label: 'Author Publishing' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item name="serviceTier" label={<span className="font-medium text-slate">Service Tier</span>} rules={[{ required: true }]}>
                                <Select
                                    options={[
                                        { value: 'review', label: 'Submission Review' },
                                        { value: 'guided', label: 'Guided Publishing' },
                                        { value: 'institutional', label: 'Institutional / Premium' },
                                    ]}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item name="title" label={<span className="font-medium text-slate">{type === 'book' ? 'Book Title' : 'Paper / Journal Title'}</span>} rules={[{ required: true }]}>
                            <Input prefix={<BookOutlined style={{ color: '#94a3b8' }} />} placeholder="Manuscript title" />
                        </Form.Item>

                        <div className="grid grid-2 gap-4">
                            <Form.Item name="timeline" label={<span className="font-medium text-slate">Desired Timeline</span>} rules={[{ required: true }]}>
                                <Select
                                    options={[
                                        { value: 'Flexible', label: 'Flexible' },
                                        { value: 'Within 30 days', label: 'Within 30 days' },
                                        { value: 'Within 60 days', label: 'Within 60 days' },
                                        { value: 'Institutional schedule', label: 'Institutional schedule' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item name="region" label={<span className="font-medium text-slate">Primary Region</span>}>
                                <Input placeholder="Target region" />
                            </Form.Item>
                        </div>

                        <Form.Item name="description" label={<span className="font-medium text-slate">Abstract / Project Summary <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.8rem' }}>(max 800 words)</span></span>} rules={[{ required: true, min: 20 }]}>
                            <TextArea rows={4} placeholder="Summarize the manuscript, objectives, and intended audience" showCount maxLength={5000} />
                        </Form.Item>

                        <Form.Item label="Upload Cover Image">
                            <Dragger {...coverUploadProps} style={{ background: '#f8fafc', padding: '20px' }}>
                                <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                                <p className="ant-upload-text text-sm">Upload a cover or project visual (JPG/PNG)</p>
                            </Dragger>
                            <p className="cover-upload-hint">
                                Recommended: <strong>1600 × 2400 px</strong> (2:3 portrait). Accepted: JPG, PNG — max 5 MB.
                            </p>
                        </Form.Item>

                        <Form.Item label="Upload Manuscript">
                            <Dragger {...uploadProps}>
                                <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#1890ff' }} /></p>
                                <p className="ant-upload-text text-sm">Upload the manuscript (PDF/DOCX)</p>
                            </Dragger>
                        </Form.Item>

                        <Form.Item
                            name="consent"
                            valuePropName="checked"
                            rules={[{
                                validator: (_, value) => value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Please confirm that the submission information is accurate')),
                            }]}
                        >
                            <Checkbox>
                                I confirm that the submission details are accurate and I understand the team may contact me for review clarification.
                            </Checkbox>
                        </Form.Item>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8" style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-light)', flexDirection: 'column-reverse' }}>
                <Button size="large" onClick={() => router.push('/')} block style={{ maxWidth: '100%' }}>Cancel</Button>
                <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    block
                    icon={<CloudUploadOutlined />}
                    style={{ maxWidth: '100%', height: '48px', boxShadow: '0 4px 14px rgba(24,144,255,0.3)' }}
                >
                    Submit for Editorial Intake
                </Button>
            </div>
        </Form>
    );
};
