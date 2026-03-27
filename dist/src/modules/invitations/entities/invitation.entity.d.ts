import { Role } from '../../roles/entities/role.entity.js';
import { Business } from '../../businesses/entities/business.entity.js';
export declare class Invitation {
    id: string;
    token: string;
    email: string;
    roleId: string;
    role?: Role;
    businessId: string;
    business?: Business;
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
