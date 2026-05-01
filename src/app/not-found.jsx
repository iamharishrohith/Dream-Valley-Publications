import Link from 'next/link';
import { Button, Card, Result } from 'antd';

export default function NotFound() {
    return (
        <div className="page-wrapper container flex items-center justify-center">
            <Card className="premium-card" variant="borderless" style={{ maxWidth: 680, width: '100%' }}>
                <Result
                    status="404"
                    title="That page isn’t available"
                    subTitle="The route may have moved, the URL may be incorrect, or the content may not be public."
                    extra={[
                        <Link key="home" href="/">
                            <Button type="primary" size="large">Back Home</Button>
                        </Link>,
                        <Link key="services" href="/services">
                            <Button size="large">Explore Services</Button>
                        </Link>,
                    ]}
                />
            </Card>
        </div>
    );
}
