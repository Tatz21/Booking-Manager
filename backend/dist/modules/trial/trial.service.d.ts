import { PrismaService } from '../../database/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
export interface SubscriptionAccessStatus {
    businessId: string;
    plan: string;
    status: SubscriptionStatus;
    trialStart: Date;
    trialEnd: Date;
    currentPeriodEnd: Date | null;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
    canAccessPlatform: boolean;
    daysRemaining: number;
    priceInr: number;
}
export declare class TrialService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getSubscriptionStatus(businessId: string): Promise<SubscriptionAccessStatus>;
    checkAccess(businessId: string): Promise<boolean>;
}
