import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockAuthResponse = {
    accessToken: 'mock-jwt-access',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
    user: {
      id: 'u-1',
      email: 'owner@test.com',
      name: 'Owner',
      role: 'OWNER',
    },
    business: {
      id: 'b-1',
      name: 'Test Business',
      slug: 'test-business-1234',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockAuthResponse),
      login: jest.fn().mockResolvedValue(mockAuthResponse),
      refreshTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      }),
      logout: jest.fn().mockResolvedValue({ success: true, message: 'Logged out' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    const dto = {
      email: 'owner@test.com',
      password: 'P@ssword123!',
      name: 'Owner',
      businessName: 'Test Business',
    };
    const res = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(res).toEqual(mockAuthResponse);
  });

  it('should call login', async () => {
    const dto = {
      email: 'owner@test.com',
      password: 'P@ssword123!',
    };
    const res = await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(res).toEqual(mockAuthResponse);
  });

  it('should call refresh', async () => {
    const dto = { refreshToken: 'valid-refresh-token' };
    const res = await controller.refresh(dto);
    expect(authService.refreshTokens).toHaveBeenCalledWith(dto);
    expect(res.accessToken).toBe('new-access-token');
  });

  it('should call logout', async () => {
    const res = await controller.logout('u-1', { refreshToken: 'token' });
    expect(authService.logout).toHaveBeenCalledWith('u-1', 'token');
    expect(res.success).toBe(true);
  });
});
