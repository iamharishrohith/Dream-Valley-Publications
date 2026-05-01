import { Card, Tag } from 'antd';
import { RESOURCE_TOPICS, COMPANY } from '@/lib/site';

export const metadata = {
    title: 'Publishing Resources',
    description: `Explore discoverability-first publishing resources, guides, and topic clusters from ${COMPANY.name}.`,
};

export default function ResourcesPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Resources and discoverability</p>
                <h1 className="premium-title">Built to answer publishing questions before visitors even contact us</h1>
                <p className="premium-copy">
                    This section is designed for SEO, AEO, GEO, SXO, and AI discoverability. It gives authors and institutions a cleaner way to understand topics that influence high-intent publishing decisions.
                </p>
            </section>

            <section className="premium-grid premium-grid-two">
                <Card className="premium-card" variant="borderless">
                    <h2 className="premium-card-title">Priority topic clusters</h2>
                    <div className="premium-tag-wrap">
                        {RESOURCE_TOPICS.map((topic) => (
                            <Tag key={topic} color="blue">{topic}</Tag>
                        ))}
                    </div>
                </Card>
                <Card className="premium-card" variant="borderless">
                    <h2 className="premium-card-title">What this content strategy supports</h2>
                    <ul className="premium-list">
                        <li>Search-intent landing pages for publishing services</li>
                        <li>Answer-ready content blocks for AI and search snippets</li>
                        <li>Authority-building guides for academics and authors</li>
                        <li>Consistent factual language across every trust surface</li>
                    </ul>
                    <p className="text-gray">
                        The next phase should expand this area into a full editorial hub with guides, comparisons, FAQs, and glossary pages.
                    </p>
                </Card>
            </section>

            <section className="premium-callout">
                <h2 className="premium-section-title">Regional and institutional relevance</h2>
                <p className="text-gray">
                    The current launch posture is optimized for {COMPANY.region}-based consultation expectations while staying globally legible for academic and author publishing intent.
                </p>
            </section>
        </div>
    );
}
