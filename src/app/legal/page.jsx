import { Card, Typography, Divider } from 'antd';
import { COMPANY } from '@/lib/site';

const { Title, Paragraph } = Typography;

export const metadata = {
    title: 'Terms & Privacy',
    description: `Terms of Service and Privacy Policy for ${COMPANY.name}.`,
};

export default function LegalPage() {
    return (
        <main className="page-wrapper container" style={{ maxWidth: '56rem' }}>
            <article>
                <Card className="shadow-soft rounded-xl border-none p-8 premium-card">
                    <Title level={1} style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Legal Information</Title>

                    <Title level={2} style={{ fontSize: '1.75rem', marginTop: '2rem' }}>Terms of Service</Title>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        Welcome to {COMPANY.name}. By accessing or using our website, services, or content, you agree to comply with and be bound by the following terms and conditions.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>1. Acceptance of Terms</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        By using our portal, you signify your agreement to these Terms of Service. If you do not agree to these terms, you may not use our services.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>2. Intellectual Property Rights</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        All content published by {COMPANY.name}, including text, graphics, logos, and academic output, is the property of {COMPANY.name} or its authors and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without explicit permission.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>3. Submissions</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        By submitting a manuscript, you warrant that the work is original, has not been published previously, and is not under consideration elsewhere. You grant {COMPANY.name} the right to review and potentially publish your submission.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>4. Disclaimer of Warranties</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        Our services are provided &ldquo;as is&rdquo; without any warranties, express or implied. We do not guarantee that our website will be error-free or uninterrupted.
                    </Paragraph>

                    <Divider style={{ margin: '2.5rem 0' }} />

                    <Title level={2} style={{ fontSize: '1.75rem' }}>Privacy Policy</Title>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        At {COMPANY.name}, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>1. Information Collection</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        We collect information that you voluntarily provide to us, such as your name, email address, affiliation, and manuscript details when you submit a proposal or contact us.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>2. Use of Information</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        The information we collect is used to process your submissions, communicate with you regarding our services, and improve our website experience. We do not sell your personal data to third parties.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>3. Data Security</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or disclosure.
                    </Paragraph>

                    <Title level={3} style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>4. Cookies</Title>
                    <Paragraph style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        Our website may use cookies to enhance user experience. You can choose to set your web browser to refuse cookies, but some parts of the site may not function properly.
                    </Paragraph>
                </Card>
            </article>
        </main>
    );
}
