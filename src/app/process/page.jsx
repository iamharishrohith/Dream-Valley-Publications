import { Card, Steps } from 'antd';
import { COMPANY } from '@/lib/site';

export const metadata = {
    title: 'Publishing Process',
    description: `Understand the premium publishing workflow used by ${COMPANY.name}.`,
};

const steps = [
    {
        title: 'Qualification',
        description: 'We review the lane, manuscript type, files, and fit before deeper publishing work begins.',
    },
    {
        title: 'Submission Intake',
        description: 'Structured metadata, asset validation, and initial editorial readiness checks are completed.',
    },
    {
        title: 'Editorial Review',
        description: 'The team evaluates process readiness, publication direction, and any required follow-up information.',
    },
    {
        title: 'Publication Workflow',
        description: 'Approved projects move into a guided workflow with clearer status visibility and controlled admin actions.',
    },
];

export default function ProcessPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Publishing process</p>
                <h1 className="premium-title">A publishing workflow designed for clarity, not guesswork</h1>
                <p className="premium-copy">
                    {COMPANY.name} is being rebuilt around a status-driven premium workflow so authors and institutions know what happens next at each stage.
                </p>
            </section>

            <Card className="premium-card" variant="borderless">
                <Steps
                    direction="vertical"
                    items={steps}
                />
            </Card>
        </div>
    );
}
