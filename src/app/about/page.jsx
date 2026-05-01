import { Card, Typography } from 'antd';
import { COMPANY } from '@/lib/site';

const { Title, Paragraph } = Typography;

export const metadata = {
    title: 'About',
    description: `Learn about ${COMPANY.name}, its publishing philosophy, and its trust-first launch direction.`,
};

export default function About() {
    return (
        <main className="page-wrapper container" style={{ maxWidth: '56rem' }}>
            <article>
                <Card className="shadow-soft rounded-xl border-none p-8 premium-card">
                    <Title level={1} style={{ fontSize: '2rem' }}>About {COMPANY.name}</Title>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        {COMPANY.name} is being shaped as a premium boutique publishing platform for academics, institutions, and serious authors who value clearer workflow, better editorial communication, and stronger trust signals.
                    </Paragraph>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        The current direction is evidence-first: the site should only promise workflows, standards, and publishing outcomes that the platform can support operationally.
                    </Paragraph>
                    <Title level={2} style={{ fontSize: '1.5rem', marginTop: '2rem' }}>What we are building toward</Title>
                    <Paragraph style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        A guided publishing experience with stronger discoverability, structured submission handling, admin governance, and premium public presentation across books, journals, theses, and serious manuscripts.
                    </Paragraph>
                </Card>
            </article>
        </main>
    );
}
