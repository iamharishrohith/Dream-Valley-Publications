export const trackEvent = (event, payload = {}) => {
    if (typeof window === 'undefined') return;

    const queue = window.__dvpTelemetry || [];
    queue.push({
        event,
        payload,
        timestamp: new Date().toISOString(),
    });
    window.__dvpTelemetry = queue;

    if (process.env.NODE_ENV !== 'production') {
        console.info('[telemetry]', event, payload);
    }
};
