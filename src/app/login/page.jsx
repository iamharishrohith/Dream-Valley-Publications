'use client';

import { Card, Button, Typography, Input, Form, Tabs } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'sonner';

const { Title, Text } = Typography;

export default function Login() {
    const { login, register, isAdmin, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onLogin = async (values) => {
        setLoading(true);
        try {
            const profile = await login(values.email, values.password);
            router.push(profile.role === 'admin' || profile.role === 'editor' ? '/admin' : '/dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onRegister = async (values) => {
        setLoading(true);
        try {
            await register(values.name, values.email, values.password);
            router.push('/dashboard');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Card className="auth-card shadow-xl rounded-2xl border">
                <div className="mb-6">
                    <Title level={2} style={{ marginBottom: 8, color: 'var(--color-primary)' }}>
                        {user ? 'Account Access' : 'Publishing Account Access'}
                    </Title>
                    <Text type="secondary">
                        Authors can create accounts to track submissions. Editorial accounts continue to access the protected admin workflow.
                    </Text>
                </div>

                <Tabs
                    defaultActiveKey="login"
                    items={[
                        {
                            key: 'login',
                            label: 'Sign In',
                            children: (
                                <Form onFinish={onLogin} layout="vertical" size="large" style={{ marginTop: 24, textAlign: 'left' }}>
                                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                                        <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Email Address" />
                                    </Form.Item>

                                    <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
                                        <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Password" />
                                    </Form.Item>

                                    <Button type="primary" htmlType="submit" block loading={loading}
                                        style={{ height: 48, fontSize: '1.125rem', fontWeight: 500, boxShadow: 'var(--shadow-blue)' }}>
                                        Sign In
                                    </Button>
                                </Form>
                            ),
                        },
                        {
                            key: 'register',
                            label: 'Create Author Account',
                            children: (
                                <Form onFinish={onRegister} layout="vertical" size="large" style={{ marginTop: 24, textAlign: 'left' }}>
                                    <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
                                        <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Full Name" />
                                    </Form.Item>

                                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                                        <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Email Address" />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[
                                            { required: true, min: 8, message: 'Password must be at least 8 characters' },
                                            {
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                                message: 'Use uppercase, lowercase, and a number',
                                            },
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Password" />
                                    </Form.Item>

                                    <Button type="primary" htmlType="submit" block loading={loading}
                                        style={{ height: 48, fontSize: '1.125rem', fontWeight: 500, boxShadow: 'var(--shadow-blue)' }}>
                                        Create Account
                                    </Button>
                                </Form>
                            ),
                        },
                    ]}
                />

                <div className="auth-info">
                    <strong>{isAdmin ? 'Editorial Access Enabled:' : 'Editorial Accounts Remain Controlled:'}</strong><br />
                    Admin and editor roles are still provisioned intentionally, while standard author accounts can use the dashboard to track their submissions.
                </div>
            </Card>
        </div>
    );
}
