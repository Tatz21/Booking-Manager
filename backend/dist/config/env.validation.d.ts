import 'reflect-metadata';
export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    API_PREFIX: string;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRATION: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRATION: string;
    RAZORPAY_KEY_ID: string;
    RAZORPAY_KEY_SECRET: string;
    RAZORPAY_WEBHOOK_SECRET: string;
    SUBSCRIPTION_PLAN_PRICE_INR: number;
    SUBSCRIPTION_TRIAL_DAYS: number;
    APP_URL: string;
    CORS_ORIGIN: string;
    THROTTLE_TTL: number;
    THROTTLE_LIMIT: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
