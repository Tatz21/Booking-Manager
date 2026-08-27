import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AssignServicesDto } from './dto/assign-services.dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    findAll(businessId: string, includeInactive: boolean): Promise<({
        staffServices: ({
            service: {
                name: string;
                currency: string;
                id: string;
                durationMinutes: number;
                price: number;
                isActive: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            businessId: string;
            staffId: string;
            serviceId: string;
        })[];
    } & {
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
    })[]>;
    create(businessId: string, dto: CreateStaffDto): Promise<{
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
    }>;
    findOne(businessId: string, id: string): Promise<{
        staffAvailability: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            staffId: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            isOff: boolean;
            breaksJson: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        staffServices: ({
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
        } & {
            id: string;
            createdAt: Date;
            businessId: string;
            staffId: string;
            serviceId: string;
        })[];
    } & {
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
    }>;
    update(businessId: string, id: string, dto: UpdateStaffDto): Promise<{
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
    }>;
    remove(businessId: string, id: string): Promise<{
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
    }>;
    assignServices(businessId: string, id: string, dto: AssignServicesDto): Promise<{
        success: boolean;
        assignedCount: number;
    }>;
}
