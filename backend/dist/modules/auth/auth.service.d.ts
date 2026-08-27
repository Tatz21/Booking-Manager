import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { ResetPasswordDto } from './dto/password-reset.dto';
import { AuthResponseDto, TokenRefreshResponseDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private inMemoryUsers;
    private inMemoryRefreshTokens;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private initDefaultInMemoryUsers;
    private hashToken;
    private generateSlug;
    private generateTokens;
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refreshTokens(dto: RefreshTokenDto): Promise<TokenRefreshResponseDto>;
    logout(userId: string, refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
        testResetToken?: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
