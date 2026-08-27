import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrialService } from './trial.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CurrentBusinessId } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments & Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('business/subscription-status')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current business trial and subscription status',
    description:
      'Calculates whether the business is within its 7-day free trial or has an active ₹199/month paid subscription.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status details',
  })
  async getStatus(@CurrentBusinessId() businessId: string) {
    return this.trialService.getSubscriptionStatus(businessId);
  }
}
