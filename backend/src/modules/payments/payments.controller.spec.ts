import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: any;

  beforeEach(async () => {
    service = {
      createSubscriptionOrder: jest.fn().mockResolvedValue({
        orderId: 'order_123',
        amount: 19900,
        currency: 'INR',
        keyId: 'rzp_key',
        businessName: 'Apex Barber Studio',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        success: true,
        message: 'Subscription activated',
        subscriptionStatus: 'ACTIVE',
        currentPeriodEnd: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: service }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create subscription order', async () => {
    const res = await controller.createSubscriptionOrder('biz-1');
    expect(res.orderId).toBe('order_123');
    expect(service.createSubscriptionOrder).toHaveBeenCalledWith('biz-1');
  });

  it('should verify payment signature', async () => {
    const dto = {
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_123',
      razorpaySignature: 'sig_123',
    };
    const res = await controller.verifyPayment('biz-1', dto);
    expect(res.success).toBe(true);
    expect(service.verifyPayment).toHaveBeenCalledWith('biz-1', dto);
  });
});
