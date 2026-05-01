import './globals.css';
import { Providers } from './providers';
import { COMPANY, NAV_LANES, RESOURCE_TOPICS } from '@/lib/site';

const SITE_URL = COMPANY.url;
const SITE_NAME = COMPANY.name;
const SITE_DESC = COMPANY.description;

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESC,
    keywords: [
        'premium academic publishing',
        'author publishing services',
        'thesis publishing',
        'journal publishing',
        'conference proceedings publishing',
        'book publishing services',
        'publishing workflow',
        'Dream Valley Publications',
        ...RESOURCE_TOPICS,
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'publishing',
    formatDetection: { email: false, telephone: false },
    alternates: { canonical: SITE_URL },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: SITE_URL,
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DESC,
        images: [
            {
                url: '/Assets/new-dark-logo.jpg',
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} brand preview`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: SITE_DESC,
        images: ['/Assets/new-dark-logo.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

const jsonLd = [
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/Assets/new-dark-logo.jpg`,
        description: SITE_DESC,
        email: COMPANY.supportEmail,
        telephone: COMPANY.phone,
        address: {
            '@type': 'PostalAddress',
            addressCountry: COMPANY.region,
        },
        areaServed: ['India', 'Global'],
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: COMPANY.supportEmail,
                availableLanguage: ['English'],
            },
            {
                '@type': 'ContactPoint',
                contactType: 'consultation',
                email: COMPANY.consultationEmail,
                availableLanguage: ['English'],
            },
        ],
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESC,
        inLanguage: 'en',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/books?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Publishing Service Lanes',
        itemListElement: NAV_LANES.map((lane, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: lane.title,
            url: `${SITE_URL}${lane.href}`,
            description: lane.description,
        })),
    },
];

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://res.cloudinary.com" />
                {jsonLd.map((schema, index) => (
                    <script
                        key={`ld-${index}`}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                ))}
            </head>
            <body suppressHydrationWarning>
                <a href="#main-content" className="skip-nav">Skip to main content</a>
                <Providers>
                    <div id="main-content" role="main">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
