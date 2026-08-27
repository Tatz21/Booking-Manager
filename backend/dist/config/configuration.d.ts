declare const _default: () => {
    port: number;
    environment: string;
    apiPrefix: string;
    database: {
        url: string | undefined;
    };
    jwt: {
        accessSecret: string | undefined;
        accessExpiration: string;
        refreshSecret: string | undefined;
        refreshExpiration: string;
    };
    razorpay: {
        keyId: string;
        keySecret: string;
        webhookSecret: string;
    };
    subscription: {
        priceInr: number;
        trialDays: number;
    };
    appUrl: string;
    cors: {
        origin: string;
    };
    throttler: {
        ttl: number;
        limit: number;
    };
};
export default _default;
