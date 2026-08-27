import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Swagger / OpenAPI Specification', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockPrisma = {};
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should generate complete OpenAPI 3.0 specification with all route definitions', () => {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Appointment Booking SaaS API')
      .setVersion('1.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    expect(document.openapi).toBeDefined();
    expect(document.info.title).toBe('Appointment Booking SaaS API');

    const paths = Object.keys(document.paths);
    expect(paths).toContain('/health');
    expect(paths).toContain('/auth/register');
    expect(paths).toContain('/auth/login');
    expect(paths).toContain('/business');
    expect(paths).toContain('/services');
    expect(paths).toContain('/staff');
    expect(paths).toContain('/availability/business-hours');
    expect(paths).toContain('/customers');
    expect(paths).toContain('/appointments');
    expect(paths).toContain('/public/{slug}');
    expect(paths).toContain('/payments/create-subscription');
    expect(paths).toContain('/webhooks/razorpay');
  });
});
