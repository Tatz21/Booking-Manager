"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = exports.BypassSubscriptionCheck = exports.BYPASS_SUBSCRIPTION_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const trial_service_1 = require("../trial.service");
exports.BYPASS_SUBSCRIPTION_KEY = 'bypassSubscriptionCheck';
const BypassSubscriptionCheck = () => (0, common_1.SetMetadata)(exports.BYPASS_SUBSCRIPTION_KEY, true);
exports.BypassSubscriptionCheck = BypassSubscriptionCheck;
let SubscriptionGuard = class SubscriptionGuard {
    constructor(reflector, trialService) {
        this.reflector = reflector;
        this.trialService = trialService;
    }
    async canActivate(context) {
        const bypass = this.reflector.getAllAndOverride(exports.BYPASS_SUBSCRIPTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (bypass) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.businessId) {
            return true;
        }
        const canAccess = await this.trialService.checkAccess(user.businessId);
        if (!canAccess) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.PAYMENT_REQUIRED,
                error: 'Payment Required',
                message: 'Your 7-day free trial has expired. Please subscribe to the ₹199/month plan to continue using the platform.',
            }, common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        trial_service_1.TrialService])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map