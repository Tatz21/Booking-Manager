import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBusinessId } from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'List customers for the business with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Paginated customer list',
  })
  async findAll(
    @CurrentBusinessId() businessId: string,
    @Query() query: QueryCustomersDto,
  ) {
    return this.customersService.findAll(businessId, query);
  }

  @Get(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get customer profile and full appointment history' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Customer profile with booking history',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async findOne(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(businessId, id);
  }

  @Patch(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Update customer details or notes' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerResponseDto,
  })
  async update(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(businessId, id, dto);
  }
}
