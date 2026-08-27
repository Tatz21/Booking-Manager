import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SetBusinessHoursDto } from './dto/business-hours.dto';
import { SetStaffAvailabilityDto } from './dto/staff-availability.dto';
import { QuerySlotsDto } from './dto/query-slots.dto';

export interface AvailableSlot {
  time: string; // HH:MM in business timezone
  startAt: string; // UTC ISO string
  endAt: string; // UTC ISO string
  staffId: string;
  staffName: string;
}

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBusinessHours(businessId: string) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const hours = await this.prisma.businessHours.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return hours;
  }

  async setBusinessHours(businessId: string, dto: SetBusinessHoursDto) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    return this.prisma.$transaction(async (tx) => {
      for (const day of dto.hours) {
        await tx.businessHours.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId,
              dayOfWeek: day.dayOfWeek,
            },
          },
          update: {
            openTime: day.openTime,
            closeTime: day.closeTime,
            isClosed: day.isClosed ?? false,
            breaksJson: day.breaks ? (day.breaks as any) : undefined,
          },
          create: {
            businessId,
            dayOfWeek: day.dayOfWeek,
            openTime: day.openTime,
            closeTime: day.closeTime,
            isClosed: day.isClosed ?? false,
            breaksJson: day.breaks ? (day.breaks as any) : undefined,
          },
        });
      }

      return tx.businessHours.findMany({
        where: { businessId },
        orderBy: { dayOfWeek: 'asc' },
      });
    });
  }

  async getStaffAvailability(businessId: string, staffId: string) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, businessId, isDeleted: false },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${staffId}" not found`);
    }

    return this.prisma.staffAvailability.findMany({
      where: { staffId, businessId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async setStaffAvailability(
    businessId: string,
    staffId: string,
    dto: SetStaffAvailabilityDto,
  ) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, businessId, isDeleted: false },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${staffId}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      for (const shift of dto.shifts) {
        await tx.staffAvailability.upsert({
          where: {
            staffId_dayOfWeek: {
              staffId,
              dayOfWeek: shift.dayOfWeek,
            },
          },
          update: {
            startTime: shift.startTime,
            endTime: shift.endTime,
            isOff: shift.isOff ?? false,
            breaksJson: shift.breaks ? (shift.breaks as any) : undefined,
          },
          create: {
            businessId,
            staffId,
            dayOfWeek: shift.dayOfWeek,
            startTime: shift.startTime,
            endTime: shift.endTime,
            isOff: shift.isOff ?? false,
            breaksJson: shift.breaks ? (shift.breaks as any) : undefined,
          },
        });
      }

      return tx.staffAvailability.findMany({
        where: { staffId, businessId },
        orderBy: { dayOfWeek: 'asc' },
      });
    });
  }

  private parseTimeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return h * 60 + m;
  }

  private formatMinutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  async getAvailableSlots(businessId: string, query: QuerySlotsDto) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const [business, service, settings] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: businessId },
        include: { businessHours: true },
      }),
      this.prisma.service.findFirst({
        where: { id: query.serviceId, businessId, isDeleted: false, isActive: true },
      }),
      this.prisma.bookingSettings.findUnique({
        where: { businessId },
      }),
    ]);

    if (!business) throw new NotFoundException('Business not found');
    if (!service) throw new NotFoundException('Service not found or inactive');

    const slotInterval = settings?.slotIntervalMinutes || 30;
    const minNoticeMinutes = settings?.minNoticeMinutes || 60;

    // Parse date: e.g. "2026-09-01"
    const [year, month, day] = query.date.split('-').map(Number);
    const targetDateObj = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = targetDateObj.getUTCDay();

    // Check business operating hours for this day of week
    const bizHours = business.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
    if (!bizHours || bizHours.isClosed) {
      return {
        date: query.date,
        timezone: business.timezone,
        availableSlots: [],
      };
    }

    const bizOpenMin = this.parseTimeToMinutes(bizHours.openTime);
    const bizCloseMin = this.parseTimeToMinutes(bizHours.closeTime);
    const bizBreaks = (bizHours.breaksJson as any[]) || [];

    // Find candidate staff members qualified for this service
    let staffList = await this.prisma.staff.findMany({
      where: {
        businessId,
        isDeleted: false,
        isActive: true,
        ...(query.staffId ? { id: query.staffId } : {}),
        staffServices: {
          some: { serviceId: query.serviceId },
        },
      },
      include: {
        staffAvailability: {
          where: { dayOfWeek },
        },
      },
    });

    if (query.staffId && staffList.length === 0) {
      throw new BadRequestException('Selected staff member is not available for this service');
    }

    const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    // Fetch existing confirmed/pending appointments on this day
    const appointments = await this.prisma.appointment.findMany({
      where: {
        businessId,
        staffId: { in: staffList.map((s) => s.id) },
        status: { in: ['CONFIRMED', 'PENDING'] },
        startAt: { gte: startOfDayUTC, lte: endOfDayUTC },
      },
    });

    const now = new Date();
    const serviceDuration = service.durationMinutes;
    const availableSlots: AvailableSlot[] = [];

    for (const staff of staffList) {
      const shift = staff.staffAvailability[0];
      if (!shift || shift.isOff) continue;

      const staffStartMin = this.parseTimeToMinutes(shift.startTime);
      const staffEndMin = this.parseTimeToMinutes(shift.endTime);
      const staffBreaks = (shift.breaksJson as any[]) || [];

      const effectiveStartMin = Math.max(bizOpenMin, staffStartMin);
      const effectiveEndMin = Math.min(bizCloseMin, staffEndMin);

      // Staff existing appointments
      const staffAppointments = appointments.filter((a) => a.staffId === staff.id);

      for (
        let slotMin = effectiveStartMin;
        slotMin + serviceDuration <= effectiveEndMin;
        slotMin += slotInterval
      ) {
        const slotStartMin = slotMin;
        const slotEndMin = slotMin + serviceDuration;

        // Check business break overlap
        const overlapsBizBreak = bizBreaks.some((brk) => {
          const bStart = this.parseTimeToMinutes(brk.start);
          const bEnd = this.parseTimeToMinutes(brk.end);
          return slotStartMin < bEnd && slotEndMin > bStart;
        });
        if (overlapsBizBreak) continue;

        // Check staff break overlap
        const overlapsStaffBreak = staffBreaks.some((brk) => {
          const bStart = this.parseTimeToMinutes(brk.start);
          const bEnd = this.parseTimeToMinutes(brk.end);
          return slotStartMin < bEnd && slotEndMin > bStart;
        });
        if (overlapsStaffBreak) continue;

        // Build UTC timestamps
        const slotStartHours = Math.floor(slotStartMin / 60);
        const slotStartMins = slotStartMin % 60;
        const slotEndHours = Math.floor(slotEndMin / 60);
        const slotEndMins = slotEndMin % 60;

        const slotStartDate = new Date(
          Date.UTC(year, month - 1, day, slotStartHours, slotStartMins, 0),
        );
        const slotEndDate = new Date(
          Date.UTC(year, month - 1, day, slotEndHours, slotEndMins, 0),
        );

        // Check min notice & past time
        const minNoticeThreshold = new Date(now.getTime() + minNoticeMinutes * 60 * 1000);
        if (slotStartDate < minNoticeThreshold) {
          continue;
        }

        // Check existing appointment overlap
        const overlapsAppointment = staffAppointments.some((app) => {
          return app.startAt < slotEndDate && app.endAt > slotStartDate;
        });
        if (overlapsAppointment) continue;

        availableSlots.push({
          time: this.formatMinutesToTime(slotStartMin),
          startAt: slotStartDate.toISOString(),
          endAt: slotEndDate.toISOString(),
          staffId: staff.id,
          staffName: staff.name,
        });
      }
    }

    // Sort slots chronologically
    availableSlots.sort((a, b) => a.startAt.localeCompare(b.startAt));

    return {
      date: query.date,
      timezone: business.timezone,
      availableSlots,
    };
  }
}
