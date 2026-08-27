import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TrialService } from '../trial.service';
export declare const BYPASS_SUBSCRIPTION_KEY = "bypassSubscriptionCheck";
export declare const BypassSubscriptionCheck: () => import("@nestjs/common").CustomDecorator<string>;
export declare class SubscriptionGuard implements CanActivate {
    private readonly reflector;
    private readonly trialService;
    constructor(reflector: Reflector, trialService: TrialService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
