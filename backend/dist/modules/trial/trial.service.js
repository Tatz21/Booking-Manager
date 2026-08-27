"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TrialService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let TrialService = TrialService_1 = class TrialService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TrialService_1.name);
    }
    async getSubscriptionStatus(businessId) {
        try {
            const subscription = await this.prisma.subscription.findUnique({
                where: { businessId },
            });
            if (subscription) {
                const now = new Date();
                let status = subscription.status;
                const isTrialActive = status === client_1.SubscriptionStatus.TRIALING && now <= subscription.trialEnd;
                const isSubscriptionActive = status === client_1.SubscriptionStatus.ACTIVE &&
                    (subscription.currentPeriodEnd === null || now <= subscription.currentPeriodEnd);
                if (status === client_1.SubscriptionStatus.TRIALING && now > subscription.trialEnd) {
                    status = client_1.SubscriptionStatus.EXPIRED;
                    this.prisma.subscription
                        .update({
                        where: { id: subscription.id },
                        data: { status: client_1.SubscriptionStatus.EXPIRED },
                    })
                        .catch((err) => this.logger.error('Failed to update expired status', err));
                }
                const canAccessPlatform = isTrialActive || isSubscriptionActive;
                const msRemaining = isTrialActive
                    ? subscription.trialEnd.getTime() - now.getTime()
                    : subscription.currentPeriodEnd
                        ? subscription.currentPeriodEnd.getTime() - now.getTime()
                        : 0;
                const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
                return {
                    businessId: subscription.businessId,
                    plan: subscription.plan,
                    status,
                    trialStart: subscription.trialStart,
                    trialEnd: subscription.trialEnd,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    isTrialActive,
                    isSubscriptionActive,
                    canAccessPlatform,
                    daysRemaining,
                    priceInr: 199,
                };
            }
        }
        catch (_) { }
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000);
        return {
            businessId: businessId || 'biz-luxe-001',
            plan: 'MONTHLY_STANDARD',
            status: client_1.SubscriptionStatus.TRIALING,
            trialStart: now,
            trialEnd,
            currentPeriodEnd: null,
            isTrialActive: true,
            isSubscriptionActive: false,
            canAccessPlatform: true,
            daysRemaining: 7,
            priceInr: 199,
        };
    }
    async checkAccess(businessId) {
        const status = await this.getSubscriptionStatus(businessId);
        return status.canAccessPlatform;
    }
};
exports.TrialService = TrialService;
exports.TrialService = TrialService = TrialService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrialService);
//# sourceMappingURL=trial.service.js.map