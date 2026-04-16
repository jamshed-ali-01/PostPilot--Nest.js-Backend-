import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleInput } from './dto/create-role.input';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRoleInput: CreateRoleInput): Promise<{
        permissions: {
            id: string;
            roleIds: string[];
            name: string;
            description: string | null;
        }[];
    } & {
        id: string;
        businessId: string | null;
        name: string;
        description: string | null;
        permissionIds: string[];
        userIds: string[];
    }>;
    createPermission(name: string, description?: string): Promise<{
        id: string;
        roleIds: string[];
        name: string;
        description: string | null;
    }>;
    findAllGlobal(): Promise<({
        permissions: {
            id: string;
            roleIds: string[];
            name: string;
            description: string | null;
        }[];
    } & {
        id: string;
        businessId: string | null;
        name: string;
        description: string | null;
        permissionIds: string[];
        userIds: string[];
    })[]>;
    findAllByBusiness(businessId: string): Promise<any[]>;
    assignToUser(userId: string, roleId: string, currentUserId?: string): Promise<{
        id: string;
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
        brandColor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findPermissions(): Promise<{
        id: string;
        roleIds: string[];
        name: string;
        description: string | null;
    }[]>;
    findPermissionByName(name: string): Promise<{
        id: string;
        roleIds: string[];
        name: string;
        description: string | null;
    } | null>;
    update(id: string, updateRoleInput: Partial<CreateRoleInput>): Promise<{
        permissions: {
            id: string;
            roleIds: string[];
            name: string;
            description: string | null;
        }[];
    } & {
        id: string;
        businessId: string | null;
        name: string;
        description: string | null;
        permissionIds: string[];
        userIds: string[];
    }>;
    delete(id: string): Promise<{
        id: string;
        businessId: string | null;
        name: string;
        description: string | null;
        permissionIds: string[];
        userIds: string[];
    }>;
}
