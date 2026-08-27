import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';
export declare class ReminderCronService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    handleScheduledReminders(): Promise<void>;
    process24HourReminders(): Promise<{
        checked: number;
        sent: number;
    }>;
    process2HourReminders(): Promise<{
        checked: number;
        sent: number;
    }>;
}
