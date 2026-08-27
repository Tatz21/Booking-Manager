import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, includeInactive = false) {
    if (!businessId) {
      throw new ForbiddenException('Tenant context missing');
    }

    return this.prisma.staff.findMany({
      where: {
        businessId,
        isDeleted: false,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        staffServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
                price: true,
                currency: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(businessId: string, id: string) {
    if (!businessId) {
      throw new ForbiddenException('Tenant context missing');
    }

    const staff = await this.prisma.staff.findFirst({
      where: {
        id,
        businessId,
        isDeleted: false,
      },
      include: {
        staffServices: {
          include: {
            service: true,
          },
        },
        staffAvailability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${id}" not found`);
    }

    return staff;
  }

  async create(businessId: string, dto: CreateStaffDto) {
    if (!businessId) {
      throw new ForbiddenException('Tenant context missing');
    }

    // Validate services if provided
    if (dto.serviceIds && dto.serviceIds.length > 0) {
      const validServices = await this.prisma.service.findMany({
        where: {
          id: { in: dto.serviceIds },
          businessId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (validServices.length !== dto.serviceIds.length) {
        throw new BadRequestException('One or more selected services are invalid or belong to another business');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Staff
      const staff = await tx.staff.create({
        data: {
          businessId,
          name: dto.name.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          roleTitle: dto.roleTitle?.trim(),
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      // 2. Link Services
      if (dto.serviceIds && dto.serviceIds.length > 0) {
        for (const serviceId of dto.serviceIds) {
          await tx.staffService.create({
            data: {
              businessId,
              staffId: staff.id,
              serviceId,
            },
          });
        }
      }

      // 3. Create default weekly schedule (Mon-Sat 09:00-18:00, Sun off)
      const defaultShifts = [
        { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isOff: true },
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isOff: false },
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isOff: false },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isOff: false },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isOff: false },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isOff: false },
        { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isOff: false },
      ];

      for (const shift of defaultShifts) {
        await tx.staffAvailability.create({
          data: {
            businessId,
            staffId: staff.id,
            dayOfWeek: shift.dayOfWeek,
            startTime: shift.startTime,
            endTime: shift.endTime,
            isOff: shift.isOff,
          },
        });
      }

      return staff;
    });
  }

  async update(businessId: string, id: string, dto: UpdateStaffDto) {
    await this.findOne(businessId, id);

    if (dto.serviceIds !== undefined) {
      await this.assignServices(businessId, id, dto.serviceIds);
    }

    return this.prisma.staff.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.email !== undefined && { email: dto.email?.trim().toLowerCase() }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() }),
        ...(dto.roleTitle !== undefined && { roleTitle: dto.roleTitle?.trim() }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(businessId: string, id: string) {
    await this.findOne(businessId, id);

    // Soft delete to protect appointment history
    return this.prisma.staff.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  async assignServices(businessId: string, staffId: string, serviceIds: string[]) {
    await this.findOne(businessId, staffId);

    if (serviceIds.length > 0) {
      const validServices = await this.prisma.service.findMany({
        where: {
          id: { in: serviceIds },
          businessId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (validServices.length !== serviceIds.length) {
        throw new BadRequestException('One or more selected services are invalid or belong to another business');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Remove existing associations
      await tx.staffService.deleteMany({
        where: { staffId, businessId },
      });

      // Add new associations
      for (const serviceId of serviceIds) {
        await tx.staffService.create({
          data: {
            businessId,
            staffId,
            serviceId,
          },
        });
      }

      return { success: true, assignedCount: serviceIds.length };
    });
  }
}
