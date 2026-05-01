import { Card } from 'antd';

export const metadata = {
    title: 'Editorial Promise',
    description: 'Understand the editorial principles and premium publishing expectations behind Dream Valley Publications.',
};

const standards = [
    'Clear intake requirements before promising outcomes',
    'Evidence-first language across public pages and consultation flows',
    'Structured status progression for manuscripts and projects',
    'Human review and communication around serious submissions',
];

export default function EditorialPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Editorial promise</p>
                <h1 className="premium-title">Premium publishing should feel precise, calm, and accountable</h1>
                <p className="premium-copy">
                    The editorial direction of the platform is to guide authors through a serious process without inflated claims, ambiguous next steps, or low-trust submission experiences.
                </p>
            </section>

            <Card className="premium-card" variant="borderless">
                <h2 className="premium-card-title">Editorial operating principles</h2>
                <ul className="premium-list">
                    {standards.map((standard) => (
                        <li key={standard}>{standard}</li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
