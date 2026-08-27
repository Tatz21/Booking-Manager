export declare class PublicBusinessProfileDto {
    name: string;
    slug: string;
    type: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
    timezone: string;
    currency: string;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    customDomain: string | null;
    tagline: string | null;
    bannerUrl: string | null;
    bookingSettings: {
        slotIntervalMinutes: number;
        advanceBookingDays: number;
        minNoticeMinutes: number;
        cancellationNoticeHours: number;
    };
}
export declare class PublicBookingConfirmationDto {
    appointmentId: string;
    status: string;
    startAt: Date;
    endAt: Date;
    serviceName: string;
    staffName: string;
    price: number;
    currency: string;
    businessName: string;
}
