import { SetMetadata } from '@nestjs/common';
import { BusinessRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (BusinessRole | string)[]) => SetMetadata(ROLES_KEY, roles);
