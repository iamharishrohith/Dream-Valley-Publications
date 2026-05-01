import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const metadata = {
    title: 'Terms',
    description: 'Platform and publishing terms guidance for Dream Valley Publications.',
};

export default function TermsPage() {
    return (
        <main className="page-wrapper container" style={{ maxWidth: '56rem' }}>
            <Card className="premium-card" variant="borderless">
                <Title level={1}>Terms and Publishing Guidance</Title>
                <Paragraph>
                    Dream Valley Publications provides submission intake, editorial review support, publishing workflow coordination, and public catalog
                    presentation for books, journals, theses, proceedings, and related publishing services. Use of the platform is subject to staff review,
                    operational availability, and the specific publishing arrangement agreed for each project.
                </Paragraph>
                <Paragraph>
                    Submitting a manuscript, inquiry, or account registration does not guarantee acceptance, publication, distribution, indexing,
                    certification, or delivery within a fixed timeline. Editorial decisions, service scope, identifiers, and publication timing remain
                    subject to project review, compliance checks, and any separate commercial or institutional agreement.
                </Paragraph>
                <Paragraph>
                    Users are responsible for ensuring they have the right to submit files and metadata, and for keeping account credentials secure.
                    Platform abuse, unauthorized access attempts, misleading submission claims, or unlawful content may result in account restriction,
                    submission rejection, or administrative removal from the service.
                </Paragraph>
            </Card>
        </main>
    );
}
