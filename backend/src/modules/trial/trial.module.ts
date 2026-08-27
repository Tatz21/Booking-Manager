import { Global, Module } from '@nestjs/common';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';
import { SubscriptionGuard } from './guards/subscription.guard';

@Global()
@Module({
  controllers: [TrialController],
  providers: [TrialService, SubscriptionGuard],
  exports: [TrialService, SubscriptionGuard],
})
export class TrialModule {}
