import { CustomersService } from './customers.service';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(businessId: string, query: QueryCustomersDto): Promise<{
        items: ({
            _count: {
                appointments: number;
            };
        } & {
            email: string;
            name: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            notes: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(businessId: string, id: string): Promise<{
        appointments: ({
            service: {
                name: string;
                id: string;
                durationMinutes: number;
                price: number;
            };
            staff: {
                name: string;
                id: string;
                roleTitle: string | null;
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
    } & {
        email: string;
        name: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        notes: string | null;
    }>;
    update(businessId: string, id: string, dto: UpdateCustomerDto): Promise<{
        email: string;
        name: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        notes: string | null;
    }>;
}
