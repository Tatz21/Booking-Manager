import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should instantiate Prisma client models', () => {
    expect(service.user).toBeDefined();
    expect(service.business).toBeDefined();
    expect(service.service).toBeDefined();
    expect(service.staff).toBeDefined();
    expect(service.appointment).toBeDefined();
    expect(service.subscription).toBeDefined();
    expect(service.payment).toBeDefined();
    expect(service.customer).toBeDefined();
  });
});
