import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error', 'warn'],
    });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'test') {
      try {
        await this.$connect();
        this.logger.log('Prisma connected to PostgreSQL successfully.');
      } catch (error) {
        this.logger.error('Failed to connect to PostgreSQL database via Prisma:', error);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected.');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase can only be called in test environment');
    }
    // Delete in order to respect FK constraints
    const models = [
      'auditLog',
      'payment',
      'appointment',
      'staffAvailability',
      'businessHours',
      'staffService',
      'service',
      'staff',
      'customer',
      'bookingSettings',
      'subscription',
      'businessMembership',
      'refreshToken',
      'business',
      'user',
    ];

    for (const model of models) {
      if ((this as any)[model] && typeof (this as any)[model].deleteMany === 'function') {
        await (this as any)[model].deleteMany();
      }
    }
  }
}
