import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
export declare class AppointmentsService {
    private readonly prisma;
    private readonly notificationsService?;
    private readonly eventsGateway?;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService?: NotificationsService | undefined, eventsGateway?: EventsGateway | undefined);
    findAll(businessId: string, query: QueryAppointmentsDto): Promise<{
        items: ({
            service: {
                name: string;
                currency: string;
                id: string;
                durationMinutes: number;
                price: number;
            };
            staff: {
                name: string;
                id: string;
                roleTitle: string | null;
            };
            customer: {
                email: string;
                name: string;
                phone: string;
                id: string;
            };
        } & {
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            status: import(".prisma/client").$Enums.AppointmentStatus;
            price: number;
            staffId: string;
            serviceId: string;
            customerId: string;
            startAt: Date;
            endAt: Date;
            notes: string | null;
            cancelReason: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(businessId: string, id: string): Promise<{
        service: {
            description: string | null;
            name: string;
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            durationMinutes: number;
            price: number;
            isActive: boolean;
        };
        staff: {
            email: string | null;
            name: string;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            isActive: boolean;
            roleTitle: string | null;
        };
        customer: {
            email: string;
            name: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            notes: string | null;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        price: number;
        staffId: string;
        serviceId: string;
        customerId: string;
        startAt: Date;
        endAt: Date;
        notes: string | null;
        cancelReason: string | null;
    }>;
    create(businessId: string, dto: CreateAppointmentDto, actorUserId?: string): Promise<{
        business: {
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
        };
        service: {
            description: string | null;
            name: string;
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            durationMinutes: number;
            price: number;
            isActive: boolean;
        };
        staff: {
            email: string | null;
            name: string;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            isActive: boolean;
            roleTitle: string | null;
        };
        customer: {
            email: string;
            name: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            notes: string | null;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        price: number;
        staffId: string;
        serviceId: string;
        customerId: string;
        startAt: Date;
        endAt: Date;
        notes: string | null;
        cancelReason: string | null;
    }>;
    updateStatus(businessId: string, id: string, status: AppointmentStatus, actorUserId?: string): Promise<{
        service: {
            description: string | null;
            name: string;
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            durationMinutes: number;
            price: number;
            isActive: boolean;
        };
        staff: {
            email: string | null;
            name: string;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            isActive: boolean;
            roleTitle: string | null;
        };
        customer: {
            email: string;
            name: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            notes: string | null;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        price: number;
        staffId: string;
        serviceId: string;
        customerId: string;
        startAt: Date;
        endAt: Date;
        notes: string | null;
        cancelReason: string | null;
    }>;
    cancel(businessId: string, id: string, dto: CancelAppointmentDto, actorUserId?: string): Promise<{
        business: {
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
        };
        service: {
            description: string | null;
            name: string;
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            durationMinutes: number;
            price: number;
            isActive: boolean;
        };
        staff: {
            email: string | null;
            name: string;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isDeleted: boolean;
            isActive: boolean;
            roleTitle: string | null;
        };
        customer: {
            email: string;
            name: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            notes: string | null;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        price: number;
        staffId: string;
        serviceId: string;
        customerId: string;
        startAt: Date;
        endAt: Date;
        notes: string | null;
        cancelReason: string | null;
    }>;
}
