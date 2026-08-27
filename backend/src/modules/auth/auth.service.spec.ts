import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let jwtService: any;
  let configService: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'owner@example.com',
    passwordHash: '',
    name: 'Owner Name',
    phone: '+919999999999',
    role: 'OWNER',
    memberships: [
      {
        id: 'member-uuid-1',
        businessId: 'business-uuid-1',
        role: 'OWNER',
        business: {
          id: 'business-uuid-1',
          name: 'Super Barbershop',
          slug: 'super-barbershop-1234',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        },
      },
    ],
  };

  beforeAll(async () => {
    mockUser.passwordHash = await argon2.hash('ValidP@ssw0rd123!', {
      type: argon2.argon2id,
    });
  });

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      business: {
        create: jest.fn(),
      },
      businessMembership: {
        create: jest.fn(),
      },
      subscription: {
        create: jest.fn(),
      },
      bookingSettings: {
        create: jest.fn(),
      },
      businessHours: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prismaService);
      }),
    };

    jwtService = {
      sign: jest.fn(() => 'mocked.jwt.access.token'),
    };

    configService = {
      get: jest.fn((key: string, defaultVal: any) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret-32-chars-long';
        if (key === 'JWT_ACCESS_EXPIRATION') return '15m';
        if (key === 'subscription.trialDays') return 7;
        return defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new business owner and create trial and business atomically', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newowner@example.com',
        name: 'New Owner',
        role: 'OWNER',
      });
      prismaService.business.create.mockResolvedValue({
        id: 'new-business-id',
        name: 'New Business',
        slug: 'new-business-abc1',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      });
      prismaService.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const res = await authService.register({
        email: 'NewOwner@example.com ',
        password: 'ValidP@ssw0rd123!',
        name: 'New Owner',
        businessName: 'New Business',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newowner@example.com' },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(res).toHaveProperty('accessToken');
      expect(res).toHaveProperty('refreshToken');
      expect(res.user.email).toBe('newowner@example.com');
      expect(res.business.id).toBe('new-business-id');
    });

    it('should throw ConflictException if email is already taken', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'owner@example.com',
          password: 'ValidP@ssw0rd123!',
          name: 'Owner',
          businessName: 'Business',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return tokens and business profile', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const res = await authService.login({
        email: 'owner@example.com',
        password: 'ValidP@ssw0rd123!',
      });

      expect(res).toHaveProperty('accessToken');
      expect(res).toHaveProperty('refreshToken');
      expect(res.business.id).toBe('business-uuid-1');
    });

    it('should reject invalid password', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'owner@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'ValidP@ssw0rd123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should rotate valid refresh token and issue new token pair', async () => {
      const validToken = {
        id: 'token-1',
        userId: 'user-uuid-1',
        tokenHash: 'hashed-token',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        user: mockUser,
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(validToken);
      prismaService.refreshToken.create.mockResolvedValue({ id: 'token-2' });
      prismaService.refreshToken.update.mockResolvedValue({});

      const res = await authService.refreshTokens({
        refreshToken: 'raw-token-value',
      });

      expect(res).toHaveProperty('accessToken');
      expect(res).toHaveProperty('refreshToken');
    });

    it('should detect reuse attack when revoked token is used and revoke all sessions', async () => {
      const revokedToken = {
        id: 'token-revoked',
        userId: 'user-uuid-1',
        tokenHash: 'hashed-token',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 1000000),
        user: mockUser,
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(revokedToken);

      await expect(
        authService.refreshTokens({ refreshToken: 'compromised-token' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        data: { isRevoked: true },
      });
    });
  });

  describe('logout', () => {
    it('should revoke refresh tokens', async () => {
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      const res = await authService.logout('user-uuid-1');
      expect(res.success).toBe(true);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1', isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });

  describe('forgotPassword & resetPassword', () => {
    it('should generate reset token for existing user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update = jest.fn().mockResolvedValue(mockUser);

      const res = await authService.forgotPassword('owner@example.com');
      expect(res.success).toBe(true);
      expect(res.testResetToken).toBeDefined();
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it('should return safe response if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const res = await authService.forgotPassword('nonexistent@example.com');
      expect(res.success).toBe(true);
      expect(res.testResetToken).toBeUndefined();
    });

    it('should reset password with valid token', async () => {
      prismaService.user.findFirst = jest.fn().mockResolvedValue(mockUser);
      prismaService.user.update = jest.fn().mockResolvedValue(mockUser);
      prismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const res = await authService.resetPassword({
        token: 'valid-reset-token',
        newPassword: 'NewSecurePassword123!',
      });

      expect(res.success).toBe(true);
      expect(prismaService.user.update).toHaveBeenCalled();
    });
  });
});
