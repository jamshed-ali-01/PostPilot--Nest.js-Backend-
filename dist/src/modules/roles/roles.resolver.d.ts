import { RolesService } from './roles.service';
import { CreateRoleInput } from './dto/create-role.input';
export declare class RolesResolver {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    createRole(input: CreateRoleInput): Promise<{
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
    assignRoleToUser(userId: string, roleId: string, user: any): Promise<boolean>;
    getGlobalRoles(): Promise<({
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
    getBusinessRoles(businessId: string): Promise<({
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
    getPermissions(): Promise<{
        id: string;
        roleIds: string[];
        name: string;
        description: string | null;
    }[]>;
    createPermission(name: string, description?: string): Promise<{
        id: string;
        roleIds: string[];
        name: string;
        description: string | null;
    }>;
    updateRole(id: string, input: CreateRoleInput): Promise<{
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
    deleteRole(id: string): Promise<boolean>;
}
