import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './razorpay.service';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let razorpayService: any;

  const mockBusiness = {
    id: 'biz-1',
    name: 'Apex Barber Studio',
    subscription: { id: 'sub-1' },
  };

  const mockPayment = {
    id: 'pay-1',
    businessId: 'biz-1',
    subscriptionId: 'sub-1',
    amount: 19900,
    currency: 'INR',
    status: PaymentStatus.PENDING,
    razorpayOrderId: 'order_12345',
  };

  beforeEach(async () => {
    prisma = {
      business: {
        findUnique: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        upsert: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prisma);
      }),
    };

    razorpayService = {
      getKeyId: jest.fn().mockReturnValue('rzp_test_key_123'),
      generateOrderId: jest.fn().mockReturnValue('order_12345'),
      verifyPaymentSignature: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RazorpayService, useValue: razorpayService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create subscription order for ₹199 (19900 paise)', async () => {
    prisma.business.findUnique.mockResolvedValue(mockBusiness);
    prisma.payment.create.mockResolvedValue(mockPayment);

    const res = await service.createSubscriptionOrder('biz-1');
    expect(res.amount).toBe(19900);
    expect(res.orderId).toBe('order_12345');
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessId: 'biz-1',
        amount: 19900,
        currency: 'INR',
      }),
    });
  });

  it('should verify valid payment signature and activate subscription', async () => {
    razorpayService.verifyPaymentSignature.mockReturnValue(true);
    prisma.payment.findFirst.mockResolvedValue(mockPayment);
    prisma.payment.update.mockResolvedValue({ ...mockPayment, status: PaymentStatus.SUCCESS });
    prisma.subscription.upsert.mockResolvedValue({
      id: 'sub-1',
      status: SubscriptionStatus.ACTIVE,
    });

    const res = await service.verifyPayment('biz-1', {
      razorpayOrderId: 'order_12345',
      razorpayPaymentId: 'pay_98765',
      razorpaySignature: 'valid_signature',
    });

    expect(res.success).toBe(true);
    expect(res.subscriptionStatus).toBe('ACTIVE');
    expect(prisma.subscription.upsert).toHaveBeenCalled();
  });

  it('should reject invalid payment signature', async () => {
    razorpayService.verifyPaymentSignature.mockReturnValue(false);

    await expect(
      service.verifyPayment('biz-1', {
        razorpayOrderId: 'order_12345',
        razorpayPaymentId: 'pay_fake',
        razorpaySignature: 'forged_signature',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should process verified webhook and activate subscription', async () => {
    razorpayService.verifyWebhookSignature.mockReturnValue(true);
    prisma.payment.findFirst.mockResolvedValue(mockPayment);

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_9999',
            order_id: 'order_12345',
          },
        },
      },
    };

    const res = await service.processWebhook('raw_payload', 'valid_sig', payload);
    expect(res.status).toBe('success');
    expect(prisma.subscription.update).toHaveBeenCalled();
  });

  it('should handle duplicate webhook idempotently', async () => {
    razorpayService.verifyWebhookSignature.mockReturnValue(true);
    prisma.payment.findFirst.mockResolvedValue({
      ...mockPayment,
      status: PaymentStatus.SUCCESS,
    });

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_9999',
            order_id: 'order_12345',
          },
        },
      },
    };

    const res = await service.processWebhook('raw_payload', 'valid_sig', payload);
    expect(res.status).toBe('already_processed');
  });

  it('should reject webhook with invalid signature', async () => {
    razorpayService.verifyWebhookSignature.mockReturnValue(false);

    await expect(
      service.processWebhook('raw_payload', 'invalid_sig', {}),
    ).rejects.toThrow(UnauthorizedException);
  });
});
