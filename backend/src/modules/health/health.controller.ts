import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy and responsive',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          status: 'ok',
          uptime: 12.34,
          timestamp: '2026-08-25T17:53:00.000Z',
          environment: 'development',
          version: '1.0.0',
        },
        timestamp: '2026-08-25T17:53:00.000Z',
      },
    },
  })
  check() {
    return this.healthService.check();
  }
}
