'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/telemetry';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [interest, setInterest] = useState('Academic publishing');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }

        try {
            setLoading(true);
            await api.subscribeNewsletter({ email, interest });
            trackEvent('newsletter_subscribe', { interest });
            toast.success('You are subscribed for launch and publishing updates.');
            setEmail('');
        } catch (error) {
            toast.error(error.message || 'Subscription failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="newsletter-section reveal" aria-labelledby="newsletter-title">
            <h2 id="newsletter-title" className="newsletter-title">Stay ahead of new publishing opportunities</h2>
            <p className="newsletter-subtitle">
                Receive editorial insights, launch announcements, and publishing guidance for academics and serious authors.
            </p>
            <form className="newsletter-form newsletter-form-extended" onSubmit={handleSubmit}>
                <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-label="Email address"
                />
                <select
                    className="newsletter-select"
                    value={interest}
                    onChange={(event) => setInterest(event.target.value)}
                    aria-label="Primary interest"
                >
                    <option>Academic publishing</option>
                    <option>Author publishing</option>
                    <option>Institutional publishing</option>
                </select>
                <button type="submit" className="newsletter-submit ripple-btn" disabled={loading}>
                    {loading ? 'Joining...' : 'Subscribe'}
                </button>
            </form>
        </section>
    );
};

export default Newsletter;
