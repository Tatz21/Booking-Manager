import { ConfigService } from '@nestjs/config';
export declare class HealthService {
    private readonly configService;
    constructor(configService: ConfigService);
    check(): {
        status: string;
        uptime: number;
        timestamp: string;
        environment: string;
        version: string;
    };
}
