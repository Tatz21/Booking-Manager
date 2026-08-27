import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testEmail = `e2e_owner_${Date.now()}@example.com`;

  it('POST /api/v1/auth/register (400 on weak password)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'weak',
        name: 'Test Owner',
        businessName: 'My Barber Shop',
      })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('POST /api/v1/auth/register (400 on invalid email)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email-format',
        password: 'StrongP@ssw0rd123!',
        name: 'Test Owner',
        businessName: 'My Barber Shop',
      })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });
});
