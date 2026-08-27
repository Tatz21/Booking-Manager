import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('StaffModule (e2e)', () => {
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

  it('GET /api/v1/staff (401 Unauthorized without token)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/staff')
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });

  it('POST /api/v1/staff (401 Unauthorized without token)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/staff')
      .send({
        name: 'Alex Smith',
      })
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });
});
