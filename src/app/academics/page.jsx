import Link from 'next/link';
import { Card, Button, Steps } from 'antd';

export const metadata = {
    title: 'Academic Publishing',
    description: 'Premium academic publishing support for theses, journals, conference proceedings, and institutional projects.',
};

const academicTracks = [
    'Theses and dissertations',
    'Scholarly journals',
    'Conference proceedings',
    'Department and institutional publishing',
];

export default function AcademicsPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Academic publishing</p>
                <h1 className="premium-title">Structured support for research-led publishing workflows</h1>
                <p className="premium-copy">
                    This lane is intended for researchers, universities, journals, and conference teams that need a clearer publishing intake process and a more premium public-facing experience.
                </p>
                <Link href="/publish?lane=academic">
                    <Button type="primary" size="large">Start academic submission</Button>
                </Link>
            </section>

            <section className="premium-grid premium-grid-two">
                <Card className="premium-card" variant="borderless">
                    <h2 className="premium-card-title">Academic formats currently supported</h2>
                    <ul className="premium-list">
                        {academicTracks.map((track) => (
                            <li key={track}>{track}</li>
                        ))}
                    </ul>
                </Card>
                <Card className="premium-card" variant="borderless">
                    <h2 className="premium-card-title">What this lane prioritizes</h2>
                    <ul className="premium-list">
                        <li>Metadata completeness and abstract quality</li>
                        <li>Submission readiness and supporting files</li>
                        <li>Clear communication during intake and review</li>
                        <li>Trustworthy presentation for institutional stakeholders</li>
                    </ul>
                </Card>
            </section>

            <Card className="premium-card" variant="borderless">
                <h2 className="premium-card-title">High-level workflow</h2>
                <Steps
                    direction="vertical"
                    items={[
                        { title: 'Choose the academic lane', description: 'Tell us whether the project is a thesis, journal, proceedings volume, or institutional publication.' },
                        { title: 'Submit files and metadata', description: 'Provide authorship, abstract, keywords, and supporting publication details.' },
                        { title: 'Editorial qualification', description: 'The team reviews fit, completeness, and next-step requirements.' },
                    ]}
                />
            </Card>
        </div>
    );
}
