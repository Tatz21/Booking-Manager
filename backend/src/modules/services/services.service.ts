import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, includeInactive = false) {
    if (!businessId) {
      throw new ForbiddenException('Tenant context missing');
    }

    return this.prisma.service.findMany({
      where: {
        businessId,
        isDeleted: false,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(businessId: string, id: string) {
    if (!businessId) {
      throw new ForbiddenException('Tenant context missing');
    }

    const service = await this.prisma.service.findFirst({
      where: {
        id,
        businessId,
        isDeleted: false,
      },
      include: {
        staffServices: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                roleTitle: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    return service;
  }

  async create(businessId: string, dto: CreateServiceDto) {
    if (!businessId) {
      throw new ForbiddenException('Tenant context missing');
    }

    // Retrieve business currency if not provided
    let currency = dto.currency;
    if (!currency) {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
        select: { currency: true },
      });
      currency = business?.currency || 'INR';
    }

    return this.prisma.service.create({
      data: {
        businessId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        durationMinutes: dto.durationMinutes,
        price: dto.price,
        currency,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(businessId: string, id: string, dto: UpdateServiceDto) {
    await this.findOne(businessId, id);

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(businessId: string, id: string) {
    await this.findOne(businessId, id);

    // Soft delete to protect historical appointment relations
    return this.prisma.service.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }
}
