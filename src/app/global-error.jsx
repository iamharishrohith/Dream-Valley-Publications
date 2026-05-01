'use client';

import { Button, Result } from 'antd';

export default function GlobalError({ error, reset }) {
    console.error('Global application error:', error);

    return (
        <html>
            <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb' }}>
                <div style={{ width: '100%', maxWidth: 720, padding: 24 }}>
                    <Result
                        status="500"
                        title="A global application error occurred"
                        subTitle="The app can recover in many cases by retrying the current view."
                        extra={
                            <Button type="primary" onClick={() => reset()}>
                                Retry Application
                            </Button>
                        }
                    />
                </div>
            </body>
        </html>
    );
}
