'use client';

import { useState } from 'react';
import { Card, Typography, Form, Input, Button, Select, message } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { COMPANY } from '@/lib/site';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/telemetry';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function Contact() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await api.createContactLead(values);
            trackEvent('contact_lead_created', { lane: values.lane });
            message.success('Message received. We will respond through the appropriate publishing lane.');
            form.resetFields();
        } catch (error) {
            message.error(error.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-wrapper container" style={{ maxWidth: '64rem' }}>
            <Title level={1} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Request a publishing consultation</Title>
            <Paragraph style={{ textAlign: 'center', fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '640px', margin: '0 auto var(--space-8)' }}>
                Use this form for service questions, institutional publishing inquiries, or premium author consultations. This flow now feeds a real lead intake endpoint instead of a placeholder success message.
                <br /><br />
                <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Note for admins: Submissions here appear in the <strong>Consultation Leads</strong> tab of the Admin Dashboard.</span>
            </Paragraph>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-8)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <Card className="glass-panel" style={{ borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <MailOutlined style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }} />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-slate)' }}>Editorial email</div>
                                <div style={{ color: 'var(--color-gray)' }}>{COMPANY.supportEmail}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <PhoneOutlined style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }} />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-slate)' }}>Consultation line</div>
                                <div style={{ color: 'var(--color-gray)' }}>{COMPANY.phone}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <EnvironmentOutlined style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }} />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-slate)' }}>Primary region</div>
                                <div style={{ color: 'var(--color-gray)' }}>{COMPANY.region} · {COMPANY.timezone}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-panel" style={{ borderRadius: '16px' }}>
                        <Title level={4} style={{ marginTop: 0 }}>Ideal for this contact flow</Title>
                        <Paragraph style={{ color: 'var(--color-gray)', marginBottom: 0 }}>
                            Academic publishing inquiries, guided author publishing questions, institutional projects, and premium workflow consultation requests.
                        </Paragraph>
                    </Card>
                </div>

                <Card className="shadow-soft rounded-xl border-none p-8 premium-card">
                    <Title level={2} style={{ marginTop: 0 }}>Tell us what you need</Title>
                    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter your name' }]}>
                            <Input placeholder="Full name" />
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                            <Input placeholder="Email address" />
                        </Form.Item>
                        <Form.Item name="lane" label="Publishing lane" rules={[{ required: true, message: 'Please select a lane' }]}>
                            <Select
                                options={[
                                    { value: 'academic', label: 'Academic Publishing' },
                                    { value: 'author', label: 'Author Publishing' },
                                    { value: 'institutional', label: 'Institutional / Proceedings' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item name="subject" label="Subject">
                            <Input placeholder="Consultation, manuscript fit, institutional partnership..." />
                        </Form.Item>
                        <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter your message' }]}>
                            <TextArea rows={5} placeholder="Share your publishing goals, manuscript type, and where you need guidance." />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ padding: '0 32px' }}>
                                Send Consultation Request
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </main>
    );
}
