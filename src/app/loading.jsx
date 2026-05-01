import { Card, Spin } from 'antd';

export default function Loading() {
    return (
        <div className="page-wrapper container flex items-center justify-center">
            <Card className="premium-card" variant="borderless" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
                <Spin size="large" />
                <h2 className="premium-card-title" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                    Loading publishing workspace
                </h2>
                <p className="text-gray">
                    Preparing the next part of the experience.
                </p>
            </Card>
        </div>
    );
}
