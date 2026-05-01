import { Card } from 'antd';
import { TRUST_PILLARS, FAQS } from '@/lib/site';

export const metadata = {
    title: 'Trust and Standards',
    description: 'Discover the trust principles, publishing standards, and evidence-first policies behind Dream Valley Publications.',
};

export default function TrustPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Trust and standards</p>
                <h1 className="premium-title">Trust is built from process, proof, and consistency</h1>
                <p className="premium-copy">
                    The website is being optimized around truthful claims, better submission governance, and clearer editorial communication so authors can evaluate the platform with confidence.
                </p>
            </section>

            <section className="premium-grid premium-grid-three">
                {TRUST_PILLARS.map((pillar) => (
                    <Card key={pillar.title} className="premium-card" variant="borderless">
                        <h2 className="premium-card-title">{pillar.title}</h2>
                        <p className="text-gray">{pillar.description}</p>
                    </Card>
                ))}
            </section>

            <section className="premium-section-block">
                <div className="section-header">
                    <h2 className="section-title">Direct answers for high-intent visitors</h2>
                    <p className="section-subtitle">These answers are structured for users, search engines, and AI systems that need concise, factual descriptions.</p>
                </div>
                <div className="premium-faq-list">
                    {FAQS.map((item) => (
                        <details key={item.question} className="glass-panel premium-faq-item">
                            <summary>{item.question}</summary>
                            <p>{item.answer}</p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}
