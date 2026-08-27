import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, query: QueryCustomersDto) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
    };

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { appointments: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: {
        appointments: {
          orderBy: { startAt: 'desc' },
          include: {
            service: { select: { id: true, name: true, price: true, durationMinutes: true } },
            staff: { select: { id: true, name: true, roleTitle: true } },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return customer;
  }

  async update(businessId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(businessId, id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.email !== undefined && { email: dto.email.trim().toLowerCase() }),
        ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
        ...(dto.notes !== undefined && { notes: dto.notes.trim() }),
      },
    });
  }

  async findOrCreate(
    businessId: string,
    data: { name: string; email: string; phone: string; notes?: string },
  ) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPhone = data.phone.trim();

    // Check if customer exists by email or phone within this business
    let customer = await this.prisma.customer.findFirst({
      where: {
        businessId,
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          businessId,
          name: data.name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          notes: data.notes?.trim(),
        },
      });
    } else {
      // Update name/phone/notes if newly provided
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.name.trim(),
          ...(data.notes && { notes: data.notes.trim() }),
        },
      });
    }

    return customer;
  }
}
