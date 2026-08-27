import 'reflect-metadata';
import { validate } from './env.validation';

describe('Environment Validation', () => {
  it('should validate valid environment configuration', () => {
    const config = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_ACCESS_SECRET: 'this-is-a-valid-length-access-secret-32-chars',
      JWT_REFRESH_SECRET: 'this-is-a-valid-length-refresh-secret-32-chars',
      PORT: '3000',
    };

    const validated = validate(config);
    expect(validated.PORT).toBe(3000);
    expect(validated.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
  });

  it('should throw error when essential env variables are missing', () => {
    const invalidConfig = {
      PORT: '3000',
    };

    expect(() => validate(invalidConfig)).toThrow();
  });
});
