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
    findAllByBusiness(businessId: string): Promise<any[]>;
    assignToUser(userId: string, roleId: string, currentUserId?: string): Promise<{
        id: string;
        businessId: string;
        roleIds: string[];
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        aiTone: string | null;
        aiHashtags: string[];
        aiCaptionLength: string | null;
        aiIncludeEmojis: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findPermissions(): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    }[]>;
    findPermissionByName(name: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    } | null>;
    update(id: string, updateRoleInput: Partial<CreateRoleInput>): Promise<{
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
    delete(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        businessId: string | null;
        permissionIds: string[];
        userIds: string[];
    }>;
}
