import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleInput } from './dto/create-role.input';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRoleInput: CreateRoleInput): Promise<{
        permissions: {
            id: string;
            name: string;
            description: string | null;
            roleIds: string[];
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        businessId: string | null;
        permissionIds: string[];
        userIds: string[];
    }>;
    createPermission(name: string, description?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    }>;
    findAllGlobal(): Promise<({
        permissions: {
            id: string;
            name: string;
            description: string | null;
            roleIds: string[];
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        businessId: string | null;
        permissionIds: string[];
        userIds: string[];
    })[]>;
    findAllByBusiness(businessId: string): Promise<({
        permissions: {
            id: string;
            name: string;
            description: string | null;
            roleIds: string[];
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        businessId: string | null;
        permissionIds: string[];
        userIds: string[];
    })[]>;
    assignToUser(userId: string, roleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        businessId: string;
        roleIds: string[];
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
    }>;
    findPermissions(): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    }[]>;
}
