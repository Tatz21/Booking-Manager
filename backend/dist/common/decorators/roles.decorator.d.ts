import { BusinessRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: (BusinessRole | string)[]) => import("@nestjs/common").CustomDecorator<string>;
