import { PrismaService } from '../../database/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(businessId: string, includeInactive?: boolean): Promise<{
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
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        staffServices: ({
            staff: {
                name: string;
                id: string;
                isActive: boolean;
                roleTitle: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            businessId: string;
            staffId: string;
            serviceId: string;
        })[];
    } & {
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
    }>;
    create(businessId: string, dto: CreateServiceDto): Promise<{
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
    }>;
    update(businessId: string, id: string, dto: UpdateServiceDto): Promise<{
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
    }>;
    remove(businessId: string, id: string): Promise<{
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
    }>;
}
