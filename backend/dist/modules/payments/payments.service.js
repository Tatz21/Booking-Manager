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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const razorpay_service_1 = require("./razorpay.service");
const client_1 = require("@prisma/client");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, razorpayService) {
        this.prisma = prisma;
        this.razorpayService = razorpayService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.SUBSCRIPTION_PRICE_PAISE = 19900;
    }
    async createSubscriptionOrder(businessId) {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
            include: { subscription: true },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        const orderId = this.razorpayService.generateOrderId();
        await this.prisma.payment.create({
            data: {
                businessId,
                subscriptionId: business.subscription?.id,
                amount: this.SUBSCRIPTION_PRICE_PAISE,
                currency: 'INR',
                status: client_1.PaymentStatus.PENDING,
                razorpayOrderId: orderId,
            },
        });
        return {
            orderId,
            amount: this.SUBSCRIPTION_PRICE_PAISE,
            currency: 'INR',
            keyId: this.razorpayService.getKeyId(),
            businessName: business.name,
        };
    }
    async verifyPayment(businessId, dto) {
        const isValid = this.razorpayService.verifyPaymentSignature(dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature);
        if (!isValid) {
            this.logger.warn(`Invalid signature detected for order ${dto.razorpayOrderId} / payment ${dto.razorpayPaymentId}`);
            throw new common_1.BadRequestException('Invalid payment signature');
        }
        const payment = await this.prisma.payment.findFirst({
            where: { razorpayOrderId: dto.razorpayOrderId, businessId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment order not found for this business');
        }
        const now = new Date();
        const periodDays = 30;
        const currentPeriodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: client_1.PaymentStatus.SUCCESS,
                    razorpayPaymentId: dto.razorpayPaymentId,
                    razorpaySignature: dto.razorpaySignature,
                },
            });
            await tx.subscription.upsert({
                where: { businessId },
                update: {
                    status: client_1.SubscriptionStatus.ACTIVE,
                    currentPeriodStart: now,
                    currentPeriodEnd,
                },
                create: {
                    businessId,
                    plan: 'MONTHLY_STANDARD',
                    status: client_1.SubscriptionStatus.ACTIVE,
                    trialStart: now,
                    trialEnd: now,
                    currentPeriodStart: now,
                    currentPeriodEnd,
                },
            });
            await tx.auditLog.create({
                data: {
                    businessId,
                    action: 'SUBSCRIPTION_ACTIVATED',
                    entityType: 'Subscription',
                    entityId: payment.subscriptionId,
                    payloadJson: {
                        orderId: dto.razorpayOrderId,
                        paymentId: dto.razorpayPaymentId,
                        amount: payment.amount,
                    },
                },
            });
        });
        return {
            success: true,
            message: 'Subscription activated successfully for ₹199/month',
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd,
        };
    }
    async processWebhook(rawBody, signature, payload) {
        if (!signature) {
            throw new common_1.UnauthorizedException('Missing X-Razorpay-Signature header');
        }
        const isValid = this.razorpayService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        const event = payload?.event;
        this.logger.log(`Received verified Razorpay webhook event: ${event}`);
        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = payload?.payload?.payment?.entity;
            const orderId = paymentEntity?.order_id;
            const paymentId = paymentEntity?.id;
            if (!orderId) {
                return { status: 'ignored', message: 'No order_id in webhook payload' };
            }
            const existingPayment = await this.prisma.payment.findFirst({
                where: {
                    OR: [{ razorpayOrderId: orderId }, { razorpayPaymentId: paymentId }],
                },
            });
            if (existingPayment && existingPayment.status === client_1.PaymentStatus.SUCCESS) {
                return { status: 'already_processed', message: 'Event was already processed' };
            }
            if (existingPayment) {
                const now = new Date();
                const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                await this.prisma.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { id: existingPayment.id },
                        data: {
                            status: client_1.PaymentStatus.SUCCESS,
                            razorpayPaymentId: paymentId,
                        },
                    });
                    await tx.subscription.update({
                        where: { businessId: existingPayment.businessId },
                        data: {
                            status: client_1.SubscriptionStatus.ACTIVE,
                            currentPeriodStart: now,
                            currentPeriodEnd,
                        },
                    });
                });
            }
        }
        else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
            const subEntity = payload?.payload?.subscription?.entity;
            const razorpaySubscriptionId = subEntity?.id;
            if (razorpaySubscriptionId) {
                await this.prisma.subscription.updateMany({
                    where: { razorpaySubscriptionId },
                    data: { status: client_1.SubscriptionStatus.CANCELLED },
                });
            }
        }
        return { status: 'success', message: 'Webhook handled' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        razorpay_service_1.RazorpayService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map