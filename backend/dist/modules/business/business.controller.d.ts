import { BusinessService } from './business.service';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateBookingSettingsDto } from './dto/update-settings.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    getBusiness(businessId: string): Promise<({
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            plan: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            trialStart: Date;
            trialEnd: Date;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            razorpaySubscriptionId: string | null;
            razorpayCustomerId: string | null;
        } | null;
        bookingSettings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            slotIntervalMinutes: number;
            advanceBookingDays: number;
            minNoticeMinutes: number;
            cancellationNoticeHours: number;
            emailNotificationsEnabled: boolean;
            smsNotificationsEnabled: boolean;
            whatsappNotificationsEnabled: boolean;
            reminder24hEnabled: boolean;
            reminder2hEnabled: boolean;
        } | null;
        _count: {
            staff: number;
            services: number;
            appointments: number;
        };
    } & {
        description: string | null;
        type: string | null;
        email: string | null;
        name: string;
        phone: string | null;
        timezone: string;
        currency: string;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        logoUrl: string | null;
        primaryColor: string;
        secondaryColor: string;
        customDomain: string | null;
        tagline: string | null;
        bannerUrl: string | null;
    }) | {
        id: string;
        name: string;
        slug: string;
        type: string;
        description: string;
        email: string;
        phone: string;
        location: string;
        timezone: string;
        currency: string;
        primaryColor: string;
        secondaryColor: string;
        tagline: string;
        bookingSettings: {
            slotIntervalMinutes: number;
            advanceBookingDays: number;
            minNoticeMinutes: number;
            cancellationNoticeHours: number;
            emailNotificationsEnabled: boolean;
            smsNotificationsEnabled: boolean;
            whatsappNotificationsEnabled: boolean;
            reminder24hEnabled: boolean;
            reminder2hEnabled: boolean;
        };
        subscription: {
            plan: string;
            status: string;
            trialStart: Date;
            trialEnd: Date;
        };
        _count: {
            staff: number;
            services: number;
            appointments: number;
        };
    }>;
    updateBusiness(businessId: string, userId: string, dto: UpdateBusinessDto): Promise<{
        description: string | null;
        type: string | null;
        email: string | null;
        name: string;
        phone: string | null;
        timezone: string;
        currency: string;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        logoUrl: string | null;
        primaryColor: string;
        secondaryColor: string;
        customDomain: string | null;
        tagline: string | null;
        bannerUrl: string | null;
    }>;
    getSettings(businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        slotIntervalMinutes: number;
        advanceBookingDays: number;
        minNoticeMinutes: number;
        cancellationNoticeHours: number;
        emailNotificationsEnabled: boolean;
        smsNotificationsEnabled: boolean;
        whatsappNotificationsEnabled: boolean;
        reminder24hEnabled: boolean;
        reminder2hEnabled: boolean;
    }>;
    updateSettings(businessId: string, userId: string, dto: UpdateBookingSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        slotIntervalMinutes: number;
        advanceBookingDays: number;
        minNoticeMinutes: number;
        cancellationNoticeHours: number;
        emailNotificationsEnabled: boolean;
        smsNotificationsEnabled: boolean;
        whatsappNotificationsEnabled: boolean;
        reminder24hEnabled: boolean;
        reminder2hEnabled: boolean;
    }>;
}
