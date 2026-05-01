import { Card, Typography, Row, Col, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { COMPANY } from '@/lib/site';

const { Title, Paragraph } = Typography;

export const metadata = {
    title: 'About',
    description: `Learn about ${COMPANY.name}, our mission, and meet the founders.`,
};

export default function About() {
    return (
        <main className="page-wrapper container" style={{ maxWidth: '64rem' }}>
            <article className="pb-12">
                <Card className="shadow-soft rounded-xl border-none p-8 premium-card mb-8">
                    <Title level={1} style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>About Us</Title>
                    <Title level={2} style={{ fontSize: '1.75rem', marginTop: 0, marginBottom: '1rem' }}>Our Mission</Title>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        At Dream Valley Publications, our mission is to empower authors and researchers by providing a seamless, high-quality publishing experience. We believe in the power of knowledge and strive to disseminate academic and literary works that make a significant impact on society.
                    </Paragraph>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        We are shaping a premium boutique publishing platform for academics, institutions, and serious authors who value clearer workflow, better editorial communication, and stronger trust signals.
                    </Paragraph>
                </Card>

                <Title level={2} style={{ fontSize: '2rem', textAlign: 'center', margin: '3rem 0 2rem 0', color: 'var(--color-primary)' }}>Meet the Founders</Title>

                <Row gutter={[32, 32]}>
                    <Col xs={24} md={12}>
                        <Card className="shadow-soft rounded-xl border-none h-full premium-card" bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                            <Avatar size={160} icon={<UserOutlined />} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', border: '4px solid var(--color-primary-light)', marginBottom: '1.5rem' }} />
                            <Title level={3} style={{ marginBottom: '0.25rem' }}>Dr. K Arun Kumar</Title>
                            <span style={{ display: 'block', fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: 500 }}>Founder & Editor-in-Chief</span>
                            <Paragraph style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                                Dr. K Arun Kumar brings years of academic expertise and a deep passion for scholarly publishing. His vision drives our commitment to excellence and rigor in evaluating and disseminating impactful research and literature.
                            </Paragraph>
                        </Card>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Card className="shadow-soft rounded-xl border-none h-full premium-card" bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                            <Avatar size={160} icon={<UserOutlined />} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', border: '4px solid var(--color-primary-light)', marginBottom: '1.5rem' }} />
                            <Title level={3} style={{ marginBottom: '0.25rem' }}>Harish Rohith S</Title>
                            <span style={{ display: 'block', fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: 500 }}>Co-Founder & Technology Lead</span>
                            <Paragraph style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                                Harish Rohith S ensures that Dream Valley Publications stays at the forefront of digital publishing. His focus on seamless user experiences and modern technological integrations empowers our authors to reach a global audience effortlessly.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </article>
        </main>
    );
}
