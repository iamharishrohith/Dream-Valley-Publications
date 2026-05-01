import { Card } from 'antd';
import { COMPANY } from '@/lib/site';

export const metadata = {
    title: 'About Us',
    description: `Meet the founders and learn about the mission of ${COMPANY.name}.`,
};

export default function AboutPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">About us</p>
                <h1 className="premium-title">Building a better publishing experience</h1>
                <p className="premium-copy">
                    {COMPANY.name} is a premium boutique publishing platform for academics, institutions, and serious authors who value clearer workflow, better editorial communication, and stronger trust signals.
                </p>
            </section>

            <Card className="premium-card" variant="borderless">
                <h2 className="premium-card-title">Our Mission</h2>
                <p className="text-gray" style={{ lineHeight: 1.8 }}>
                    At {COMPANY.name}, our mission is to empower authors and researchers by providing a seamless, high-quality publishing experience. We believe in the power of knowledge and strive to disseminate academic and literary works that make a significant impact on society.
                </p>
            </Card>

            <section className="premium-section-block" style={{ marginTop: 'var(--space-12)' }}>
                <div className="section-header">
                    <h2 className="section-title">Meet the Founders</h2>
                    <p className="section-subtitle">The people behind {COMPANY.name}</p>
                </div>

                <div className="premium-grid premium-grid-two">
                    <Card className="premium-card feature-card" variant="borderless">
                        <div className="feature-icon" style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 auto var(--space-4)' }}>
                            AK
                        </div>
                        <h3 className="premium-card-title" style={{ textAlign: 'center' }}>Dr. K Arun Kumar</h3>
                        <p className="text-sm text-center" style={{ color: 'var(--color-primary)', fontStyle: 'italic', marginBottom: 'var(--space-3)' }}>Founder & Editor-in-Chief</p>
                        <p className="text-gray" style={{ textAlign: 'center', lineHeight: 1.7 }}>
                            Dr. K Arun Kumar brings years of academic expertise and a deep passion for scholarly publishing. His vision drives our commitment to excellence and rigor in evaluating and disseminating impactful research and literature.
                        </p>
                    </Card>

                    <Card className="premium-card feature-card" variant="borderless">
                        <div className="feature-icon" style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 auto var(--space-4)' }}>
                            HR
                        </div>
                        <h3 className="premium-card-title" style={{ textAlign: 'center' }}>Harish Rohith S</h3>
                        <p className="text-sm text-center" style={{ color: 'var(--color-primary)', fontStyle: 'italic', marginBottom: 'var(--space-3)' }}>Co-Founder & Technology Lead</p>
                        <p className="text-gray" style={{ textAlign: 'center', lineHeight: 1.7 }}>
                            Harish Rohith S ensures that Dream Valley Publications stays at the forefront of digital publishing. His focus on seamless user experiences and modern technological integrations empowers our authors to reach a global audience effortlessly.
                        </p>
                    </Card>
                </div>
            </section>
        </div>
    );
}
