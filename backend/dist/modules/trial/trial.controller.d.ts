import { TrialService } from './trial.service';
export declare class TrialController {
    private readonly trialService;
    constructor(trialService: TrialService);
    getStatus(businessId: string): Promise<import("./trial.service").SubscriptionAccessStatus>;
}
