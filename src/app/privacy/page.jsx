import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const metadata = {
    title: 'Privacy',
    description: 'Privacy and data-handling guidance for Dream Valley Publications.',
};

export default function PrivacyPage() {
    return (
        <main className="page-wrapper container" style={{ maxWidth: '56rem' }}>
            <Card className="premium-card" variant="borderless">
                <Title level={1}>Privacy and Data Handling</Title>
                <Paragraph>
                    Dream Valley Publications collects the information visitors choose to submit through account registration, manuscript submission,
                    contact requests, newsletter signup, and protected editorial workflows. That information is used to operate the platform, respond to
                    inquiries, review publishing submissions, and maintain administrative records.
                </Paragraph>
                <Paragraph>
                    Submission files and applicant details are intended for controlled internal access by approved staff and service providers involved in
                    publishing intake, editorial review, technical operations, storage, and security. Public catalog content is shown only after a record
                    is intentionally published through the editorial workflow.
                </Paragraph>
                <Paragraph>
                    The platform may use approved third-party infrastructure for hosting, file storage, analytics, and operational security. Users should
                    avoid submitting secrets or unrelated sensitive personal data. Requests involving account access, record correction, or operational
                    privacy questions should be directed to the published support contact for the live service.
                </Paragraph>
            </Card>
        </main>
    );
}
