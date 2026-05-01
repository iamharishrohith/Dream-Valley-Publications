'use client';

import { Card, Menu, Typography, Divider, Tag } from 'antd';
import { BookOutlined, SafetyCertificateOutlined, FileSyncOutlined, CopyrightOutlined, DollarOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

const contentMap = {
    guidelines: {
        title: 'Submission Guidance',
        icon: <BookOutlined />,
        chips: ['Author publishing', 'Editorial intake'],
        content: (
            <>
                <Paragraph>
                    This lane is built for serious authors, educators, researchers, consultants, and subject-matter experts who need a more guided publishing workflow than a generic self-publishing tool offers.
                </Paragraph>
                <Paragraph>
                    Before submitting, prepare a complete manuscript, a concise project summary, clear contact details, and any institutional or brand context that affects the publishing direction.
                </Paragraph>
            </>
        ),
    },
    ethics: {
        title: 'Publication Ethics',
        icon: <SafetyCertificateOutlined />,
        chips: ['Trust-first', 'Evidence-based claims'],
        content: (
            <>
                <Paragraph>
                    Every public promise on this site should be operationally supportable. The same standard applies to authors: manuscripts should be original, properly attributed, and submitted with truthful metadata.
                </Paragraph>
                <Paragraph>
                    Plagiarism, fabricated claims, misleading authorship, and duplicate submissions are incompatible with the platform’s trust posture.
                </Paragraph>
            </>
        ),
    },
    process: {
        title: 'Review and Intake Process',
        icon: <FileSyncOutlined />,
        chips: ['Workflow clarity', 'Premium support'],
        content: (
            <>
                <Paragraph>
                    Author submissions now enter an editorial intake workflow instead of an instant-publish flow. The team reviews fit, completeness, files, and communication readiness before moving the project forward.
                </Paragraph>
                <Paragraph>
                    High-level stages: qualification, metadata and asset check, editorial review, and next-step publishing path.
                </Paragraph>
            </>
        ),
    },
    copyright: {
        title: 'Rights and Ownership',
        icon: <CopyrightOutlined />,
        chips: ['Rights clarity', 'Author trust'],
        content: (
            <>
                <Paragraph>
                    Rights positioning should be explicit and documented before publication commitments are made. This page currently serves as a trust-oriented guidance surface rather than a final legal contract.
                </Paragraph>
                <Paragraph>
                    Final copyright, licensing, and publication rights terms should be confirmed formally during the publishing workflow.
                </Paragraph>
            </>
        ),
    },
    payment: {
        title: 'Commercial Clarity',
        icon: <DollarOutlined />,
        chips: ['Consultation-led', 'Scope-based'],
        content: (
            <>
                <Paragraph>
                    The site now follows an evidence-first commercial model. That means pricing and timelines should only be finalized after understanding the actual project scope and service lane.
                </Paragraph>
                <Paragraph>
                    Use the consultation flow for premium or complex publishing requirements before expecting fixed service commitments.
                </Paragraph>
            </>
        ),
    },
};

export default function ForAuthors() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'guidelines';
    const active = contentMap[currentTab] || contentMap.guidelines;

    const handleMenuClick = (event) => {
        router.push(`/for-authors?tab=${event.key}`);
    };

    return (
        <div className="page-wrapper container" style={{ maxWidth: '72rem' }}>
            <div className="premium-hero-block" style={{ marginBottom: 'var(--space-12)' }}>
                <p className="premium-kicker">Author publishing guidance</p>
                <h1 className="premium-title">A premium path for serious authors and expert-led books</h1>
                <p className="premium-copy">
                    This section helps authors understand the trust posture, intake logic, and preparation expectations behind the current publishing experience.
                </p>
            </div>

            <div className="authors-layout">
                <div className="authors-sidebar">
                    <Card className="shadow-sm premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <Menu
                            mode="vertical"
                            selectedKeys={[currentTab]}
                            onClick={handleMenuClick}
                            items={Object.keys(contentMap).map((key) => ({
                                key,
                                icon: contentMap[key].icon,
                                label: contentMap[key].title,
                            }))}
                            style={{ border: 'none' }}
                        />
                    </Card>
                </div>

                <div className="flex-1">
                    <Card className="shadow-md border-none premium-card" style={{ minHeight: 400 }}>
                        <div className="authors-content-icon">
                            <span className="text-2xl">{active.icon}</span>
                            <Title level={2} style={{ margin: 0 }}>{active.title}</Title>
                        </div>
                        <div className="premium-tag-wrap" style={{ marginTop: '1rem' }}>
                            {active.chips.map((chip) => (
                                <Tag key={chip} color="blue">{chip}</Tag>
                            ))}
                        </div>
                        <Divider />
                        <div className="text-lg text-gray">
                            {active.content}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
