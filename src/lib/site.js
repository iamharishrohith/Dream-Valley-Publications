export const COMPANY = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Dream Valley Publications',
    shortName: process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME || 'Dream Valley',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamvalleypublications.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dreamvalleypublications.com',
    consultationEmail: process.env.NEXT_PUBLIC_CONSULTATION_EMAIL || 'consult@dreamvalleypublications.com',
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91 90000 00000',
    region: process.env.NEXT_PUBLIC_PRIMARY_REGION || 'India',
    timezone: process.env.NEXT_PUBLIC_PRIMARY_TIMEZONE || 'IST (UTC+05:30)',
    mission: 'Premium guided publishing for academics, institutions, and serious authors.',
    description:
        'Dream Valley Publications helps academics and serious authors publish books, journals, theses, and proceedings with guided editorial workflows, transparent process visibility, and global-ready presentation.',
};

export const NAV_LANES = [
    {
        key: 'academic',
        title: 'Academic Publishing',
        href: '/services#academic-publishing',
        description: 'Theses, journals, conference proceedings, and institutional publishing.',
    },
    {
        key: 'author',
        title: 'Author Publishing',
        href: '/services#author-publishing',
        description: 'Premium publishing for experts, researchers, and serious independent authors.',
    },
];

export const TRUST_PILLARS = [
    {
        title: 'Guided Editorial Workflow',
        description: 'Every submission moves through a documented intake, review, and publication path.',
    },
    {
        title: 'Truth-Based Publishing Claims',
        description: 'We present only the services, review standards, and deliverables we can operationally support.',
    },
    {
        title: 'Premium Support Model',
        description: 'Authors and academic partners get a structured, human-centered publishing experience instead of a generic upload portal.',
    },
];

export const SERVICE_LANES = [
    {
        id: 'academic-publishing',
        title: 'Academic Publishing',
        subtitle: 'For universities, researchers, journals, theses, and conference organizers.',
        cta: '/publish?lane=academic',
        features: [
            'Thesis and dissertation publishing',
            'Journal and proceedings intake',
            'Structured review workflow',
            'Metadata, abstract, and author compliance checks',
        ],
    },
    {
        id: 'author-publishing',
        title: 'Author Publishing',
        subtitle: 'For expert authors, educators, consultants, and serious nonfiction creators.',
        cta: '/publish?lane=author',
        features: [
            'Premium manuscript intake',
            'Positioning and packaging support',
            'Transparent process milestones',
            'Launch-ready book presentation pages',
        ],
    },
];

export const FAQS = [
    {
        question: 'Who is Dream Valley Publications best suited for?',
        answer:
            'Dream Valley Publications is best suited for academics, institutions, and serious authors who want a guided publishing process with clear communication and premium presentation.',
    },
    {
        question: 'Do you support both academic and author publishing?',
        answer:
            'Yes. The platform is organized around two service lanes: academic publishing for research-led work and author publishing for expert-led books and manuscripts.',
    },
    {
        question: 'What happens after a submission is received?',
        answer:
            'Each submission enters an intake workflow where the team reviews metadata, manuscript readiness, supporting files, and fit before moving it into the next publishing stage.',
    },
    {
        question: 'Can authors track their submission status?',
        answer:
            'Yes. The platform is being structured around a status-driven workflow so authors can understand where their submission sits and what happens next.',
    },
    {
        question: 'What makes the platform premium?',
        answer:
            'Premium means a guided publishing experience, stronger trust signals, structured workflow, and communication designed for serious authors and academic stakeholders.',
    },
];

export const RESOURCE_TOPICS = [
    'Thesis publishing',
    'Journal publishing workflow',
    'Conference proceedings',
    'ISBN guidance',
    'DOI and metadata readiness',
    'Peer review expectations',
    'Publication ethics',
    'Author submission checklist',
];
