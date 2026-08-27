import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('AppointmentsModule (e2e)', () => {
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

  it('GET /api/v1/appointments (401 Unauthorized without token)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/appointments')
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });

  it('POST /api/v1/appointments (401 Unauthorized without token)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .send({
        serviceId: 's1s2s3s4-e5f6-7890-abcd-ef1234567890',
        staffId: 'st1st2st3-e5f6-7890-abcd-ef1234567890',
        startAt: '2026-09-01T10:00:00.000Z',
      })
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });
});
