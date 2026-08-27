import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TrialService } from '../trial.service';

export const BYPASS_SUBSCRIPTION_KEY = 'bypassSubscriptionCheck';
export const BypassSubscriptionCheck = () => SetMetadata(BYPASS_SUBSCRIPTION_KEY, true);

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly trialService: TrialService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bypass = this.reflector.getAllAndOverride<boolean>(BYPASS_SUBSCRIPTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (bypass) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.businessId) {
      return true; // Let AuthGuard/TenantGuard handle missing auth
    }

    const canAccess = await this.trialService.checkAccess(user.businessId);

    if (!canAccess) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Payment Required',
          message:
            'Your 7-day free trial has expired. Please subscribe to the ₹199/month plan to continue using the platform.',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
