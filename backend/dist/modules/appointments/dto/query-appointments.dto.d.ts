import { AppointmentStatus } from '@prisma/client';
export declare class QueryAppointmentsDto {
    startDate?: string;
    endDate?: string;
    staffId?: string;
    customerId?: string;
    status?: AppointmentStatus;
    page: number;
    limit: number;
}
