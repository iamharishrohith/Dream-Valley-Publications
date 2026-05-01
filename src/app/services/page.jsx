import Link from 'next/link';
import { Card, Button } from 'antd';
import { SERVICE_LANES, TRUST_PILLARS, COMPANY } from '@/lib/site';

export const metadata = {
    title: 'Publishing Services',
    description: `Explore premium academic and author publishing services from ${COMPANY.name}.`,
};

export default function ServicesPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Premium publishing services</p>
                <h1 className="premium-title">Two clear lanes. One guided publishing standard.</h1>
                <p className="premium-copy">
                    Dream Valley Publications is structured for serious authors, researchers, journals, and institutions that need stronger workflow clarity, premium presentation, and credible publishing support.
                </p>
            </section>

            <section className="premium-grid premium-grid-two">
                {SERVICE_LANES.map((lane) => (
                    <Card key={lane.id} id={lane.id} className="premium-card" variant="borderless">
                        <p className="premium-label">{lane.title}</p>
                        <h2 className="premium-section-title">{lane.subtitle}</h2>
                        <ul className="premium-list">
                            {lane.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                            ))}
                        </ul>
                        <Link href={lane.cta}>
                            <Button type="primary" size="large">Start {lane.title}</Button>
                        </Link>
                    </Card>
                ))}
            </section>

            <section className="premium-section-block">
                <div className="section-header">
                    <h2 className="section-title">Why the service model is structured this way</h2>
                    <p className="section-subtitle">The platform is built to reduce confusion, improve trust, and guide high-intent submissions into the right workflow.</p>
                </div>
                <div className="premium-grid premium-grid-three">
                    {TRUST_PILLARS.map((pillar) => (
                        <Card key={pillar.title} className="premium-card" variant="borderless">
                            <h3 className="premium-card-title">{pillar.title}</h3>
                            <p className="text-gray">{pillar.description}</p>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
