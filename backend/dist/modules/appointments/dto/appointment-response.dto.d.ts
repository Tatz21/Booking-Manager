import { AppointmentStatus } from '@prisma/client';
export declare class AppointmentResponseDto {
    id: string;
    businessId: string;
    customerId: string;
    serviceId: string;
    staffId: string;
    startAt: Date;
    endAt: Date;
    status: AppointmentStatus;
    price: number;
    currency: string;
    notes: string | null;
    cancelReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
