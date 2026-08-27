import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === 'environment') return 'test';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check status ok', () => {
    const result = controller.check();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('environment', 'test');
    expect(result).toHaveProperty('version', '1.0.0');
  });
});
