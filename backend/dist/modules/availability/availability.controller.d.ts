import { AvailabilityService } from './availability.service';
import { SetBusinessHoursDto } from './dto/business-hours.dto';
import { SetStaffAvailabilityDto } from './dto/staff-availability.dto';
import { QuerySlotsDto } from './dto/query-slots.dto';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    getBusinessHours(businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        dayOfWeek: number;
        breaksJson: import("@prisma/client/runtime/library").JsonValue | null;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }[]>;
    setBusinessHours(businessId: string, dto: SetBusinessHoursDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        dayOfWeek: number;
        breaksJson: import("@prisma/client/runtime/library").JsonValue | null;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }[]>;
    getStaffAvailability(businessId: string, staffId: string): Promise<{
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
    }[]>;
    setStaffAvailability(businessId: string, staffId: string, dto: SetStaffAvailabilityDto): Promise<{
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
    }[]>;
    getAvailableSlots(businessId: string, query: QuerySlotsDto): Promise<{
        date: string;
        timezone: string;
        availableSlots: import("./availability.service").AvailableSlot[];
    }>;
}
