import Link from 'next/link';
import { Card, Button, Tag } from 'antd';
import { COMPANY } from '@/lib/site';

export const metadata = {
    title: 'Service Tiers',
    description: `Explore premium service tiers and consultation-led publishing paths from ${COMPANY.name}.`,
};

const tiers = [
    {
        name: 'Submission Review',
        tag: 'Best for first contact',
        summary: 'For authors and academics who need an editorial fit assessment and workflow recommendation.',
        includes: ['Submission review', 'Readiness check', 'Publishing lane recommendation', 'Next-step guidance'],
    },
    {
        name: 'Guided Publishing',
        tag: 'Most requested',
        summary: 'For serious authors and researchers who need a structured intake, communication, and editorial workflow.',
        includes: ['Guided intake', 'Metadata review', 'Asset management', 'Status-driven workflow'],
    },
    {
        name: 'Institutional / Premium',
        tag: 'For complex projects',
        summary: 'For journals, proceedings, departments, and organizations with higher coordination needs.',
        includes: ['Consultation-led onboarding', 'Institutional coordination', 'Priority handling', 'Custom workflow design'],
    },
];

export default function PricingPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Service tiers</p>
                <h1 className="premium-title">Transparent paths before commercial complexity</h1>
                <p className="premium-copy">
                    We lead with clarity first. Service scope is organized into guided tiers so authors and institutions can understand the right engagement path before deeper publishing work begins.
                </p>
            </section>

            <section className="premium-grid premium-grid-three">
                {tiers.map((tier) => (
                    <Card key={tier.name} className="premium-card premium-tier-card" variant="borderless">
                        <Tag color="blue">{tier.tag}</Tag>
                        <h2 className="premium-card-title" style={{ marginTop: '1rem' }}>{tier.name}</h2>
                        <p className="text-gray">{tier.summary}</p>
                        <ul className="premium-list">
                            {tier.includes.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </section>

            <section className="premium-callout">
                <h2 className="premium-section-title">Pricing is finalized only after workflow fit is clear</h2>
                <p className="text-gray">
                    This site now uses an evidence-first policy. That means service commitments, timelines, and commercial details should only be promised once the project scope is clear and operationally supportable.
                </p>
                <Link href="/contact">
                    <Button type="primary" size="large">Request a consultation</Button>
                </Link>
                <p className="text-sm text-muted">Primary contact: {COMPANY.consultationEmail}</p>
            </section>
        </div>
    );
}
