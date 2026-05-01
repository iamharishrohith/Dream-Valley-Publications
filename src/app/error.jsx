'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Result } from 'antd';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Application route error:', error);
    }, [error]);

    return (
        <div className="page-wrapper container flex items-center justify-center">
            <Card className="premium-card" variant="borderless" style={{ maxWidth: 640, width: '100%' }}>
                <Result
                    status="error"
                    title="Something interrupted this experience"
                    subTitle="The page hit an unexpected error. You can try again or return to a stable route."
                    extra={[
                        <Button key="retry" type="primary" onClick={() => reset()}>
                            Try Again
                        </Button>,
                        <Link key="home" href="/">
                            <Button>Back Home</Button>
                        </Link>,
                    ]}
                />
            </Card>
        </div>
    );
}
