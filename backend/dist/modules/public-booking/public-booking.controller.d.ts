import { PublicBookingService } from './public-booking.service';
import { PublicBookingRequestDto, PublicAvailabilityQueryDto } from './dto/public-booking.dto';
import { PublicBusinessProfileDto, PublicBookingConfirmationDto } from './dto/public-response.dto';
export declare class PublicBookingController {
    private readonly publicBookingService;
    constructor(publicBookingService: PublicBookingService);
    getBusinessProfile(slug: string): Promise<PublicBusinessProfileDto>;
    getServices(slug: string): Promise<{
        description: string | null;
        name: string;
        currency: string;
        id: string;
        durationMinutes: number;
        price: number;
    }[]>;
    getStaff(slug: string): Promise<{
        name: string;
        id: string;
        staffServices: {
            serviceId: string;
        }[];
        roleTitle: string | null;
    }[]>;
    getAvailability(slug: string, query: PublicAvailabilityQueryDto): Promise<{
        date: string;
        timezone: string;
        availableSlots: import("../availability/availability.service").AvailableSlot[];
    }>;
    bookAppointment(slug: string, dto: PublicBookingRequestDto): Promise<PublicBookingConfirmationDto>;
}
