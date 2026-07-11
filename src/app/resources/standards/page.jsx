import { Card, Tag, Button } from 'antd';
import { COMPANY } from '@/lib/site';
import Link from 'next/link';

export const metadata = {
    title: 'International Publishing Standards',
    description: `Understand the global identifiers (ISBN, ISSN, DOI) and metadata standards required for launching publications with ${COMPANY.name}.`,
};

export default function StandardsPage() {
    return (
        <div className="page-wrapper container" style={{ maxWidth: '72rem' }}>
            <section className="premium-hero-block">
                <p className="premium-kicker">Publishing standards</p>
                <h1 className="premium-title">International Standards for Global Discoverability</h1>
                <p className="premium-copy">
                    To build trust and ensure maximum academic and trade discoverability, every book, journal, and department output published through our platform is aligned with international cataloging standards.
                </p>
            </section>

            <section className="premium-grid premium-grid-two">
                <Card className="premium-card" variant="borderless">
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <Tag color="blue">Books & Monographs</Tag>
                    </div>
                    <h2 className="premium-card-title">ISBN (International Standard Book Number)</h2>
                    <p className="text-gray mb-4">
                        An ISBN is a 13-digit commercial book identifier that is unique to each edition and variation of a publication.
                    </p>
                    <ul className="premium-list">
                        <li><strong>Global Trade Access:</strong> Necessary for listing in commercial catalogs, libraries, and global databases.</li>
                        <li><strong>Format Specific:</strong> Separate ISBNs are assigned for print and digital (e-book) editions.</li>
                        <li><strong>Platform Allocation:</strong> Dream Valley Publications automatically registers and assigns an approved ISBN to accepted book submissions upon final editorial clearance.</li>
                    </ul>
                </Card>

                <Card className="premium-card" variant="borderless">
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <Tag color="purple">Academic Serials</Tag>
                    </div>
                    <h2 className="premium-card-title">ISSN (International Standard Serial Number)</h2>
                    <p className="text-gray mb-4">
                        An ISSN is an 8-digit code used to identify newspapers, journals, and serial publications in print or electronic media.
                    </p>
                    <ul className="premium-list">
                        <li><strong>Serial Tracking:</strong> Uniquely registers recurring publications, distinguishing them from one-off books.</li>
                        <li><strong>Indexing Readiness:</strong> Required for listing in major citation databases such as Scopus, DOAJ, and Web of Science.</li>
                        <li><strong>Application Support:</strong> We guide academic departments and journal boards through the national ISSN application flow once the initial editorial board is set.</li>
                    </ul>
                </Card>
            </section>

            <section className="premium-section-block" style={{ marginTop: 'var(--space-8)' }}>
                <Card className="premium-card" variant="borderless">
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <Tag color="green">Digital Indexing</Tag>
                    </div>
                    <h2 className="premium-card-title">DOI (Digital Object Identifier) & Metadata Readiness</h2>
                    <p className="text-gray mb-4">
                        A DOI is a persistent link that uniquely identifies academic articles, journals, datasets, and theses, ensuring they remain linkable even if their hosting URL changes.
                    </p>
                    <div className="premium-grid premium-grid-two" style={{ gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Persistent Citations</h3>
                            <p className="text-sm text-gray">
                                Through our integration with CrossRef, scholarly articles are assigned a unique DOI prefix. This ensures citations count towards researchers' h-index metrics and institutional rankings.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Structured Metadata (Schema.org)</h3>
                            <p className="text-sm text-gray">
                                The platform implements automated Schema.org markup (JSON-LD) for <code>Book</code> and <code>ScholarlyArticle</code> entities. This makes all published content optimized for AI engines and academic search indexing.
                            </p>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="premium-callout text-center" style={{ marginTop: 'var(--space-12)' }}>
                <h2 className="premium-section-title">Ready to launch your publication?</h2>
                <p className="text-gray mb-6">
                    Our team will guide you through the process of setting up ISBNs, ISSNs, and DOIs, ensuring full compliance with national and international standard specifications.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                    <Link href="/publish">
                        <Button type="primary" size="large">Start Submission</Button>
                    </Link>
                    <Link href="/contact">
                        <Button size="large">Consultation</Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
