import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    businessId?: string;
    membershipRole?: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string;
        role: string;
        businessId: string;
        membershipRole: string;
    }>;
}
export {};
