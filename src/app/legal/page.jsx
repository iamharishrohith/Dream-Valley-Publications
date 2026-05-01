import { Card } from 'antd';
import { COMPANY } from '@/lib/site';

export const metadata = {
    title: 'Terms & Privacy',
    description: `Terms of Service and Privacy Policy for ${COMPANY.name}.`,
};

export default function LegalPage() {
    return (
        <div className="page-wrapper container">
            <section className="premium-hero-block">
                <p className="premium-kicker">Legal</p>
                <h1 className="premium-title">Terms & Privacy</h1>
                <p className="premium-copy">
                    By using {COMPANY.name}, you agree to the following terms and acknowledge our privacy practices.
                </p>
            </section>

            <Card className="premium-card" variant="borderless">
                <h2 className="premium-card-title">Terms of Service</h2>

                <h3 className="text-lg font-semibold mt-6 mb-2">1. Acceptance of Terms</h3>
                <p className="text-gray mb-4">
                    By using our portal, you signify your agreement to these Terms of Service. If you do not agree to these terms, you may not use our services.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">2. Intellectual Property Rights</h3>
                <p className="text-gray mb-4">
                    All content published by {COMPANY.name}, including text, graphics, logos, and academic output, is the property of {COMPANY.name} or its authors and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without explicit permission.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">3. Submissions</h3>
                <p className="text-gray mb-4">
                    By submitting a manuscript, you warrant that the work is original, has not been published previously, and is not under consideration elsewhere. You grant {COMPANY.name} the right to review and potentially publish your submission.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">4. Disclaimer of Warranties</h3>
                <p className="text-gray mb-4">
                    Our services are provided as-is without any warranties, express or implied. We do not guarantee that our website will be error-free or uninterrupted.
                </p>
            </Card>

            <Card className="premium-card" variant="borderless" style={{ marginTop: 'var(--space-8)' }}>
                <h2 className="premium-card-title">Privacy Policy</h2>

                <h3 className="text-lg font-semibold mt-6 mb-2">1. Information Collection</h3>
                <p className="text-gray mb-4">
                    We collect information that you voluntarily provide to us, such as your name, email address, affiliation, and manuscript details when you submit a proposal or contact us.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">2. Use of Information</h3>
                <p className="text-gray mb-4">
                    The information we collect is used to process your submissions, communicate with you regarding our services, and improve our website experience. We do not sell your personal data to third parties.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">3. Data Security</h3>
                <p className="text-gray mb-4">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or disclosure.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">4. Cookies</h3>
                <p className="text-gray mb-4">
                    Our website may use cookies to enhance user experience. You can choose to set your web browser to refuse cookies, but some parts of the site may not function properly.
                </p>
            </Card>
        </div>
    );
}
