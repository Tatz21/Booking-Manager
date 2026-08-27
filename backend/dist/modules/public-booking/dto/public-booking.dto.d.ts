export declare class PublicBookingRequestDto {
    serviceId: string;
    staffId?: string;
    startAt: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
}
export declare class PublicAvailabilityQueryDto {
    date: string;
    serviceId: string;
    staffId?: string;
}
