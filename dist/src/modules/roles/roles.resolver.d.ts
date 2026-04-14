import { RolesService } from './roles.service';
import { CreateRoleInput } from './dto/create-role.input';
export declare class RolesResolver {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    createRole(input: CreateRoleInput): Promise<{
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
    assignRoleToUser(userId: string, roleId: string, user: any): Promise<boolean>;
    getGlobalRoles(): Promise<({
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
    getBusinessRoles(businessId: string): Promise<any[]>;
    getPermissions(): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    }[]>;
    createPermission(name: string, description?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        roleIds: string[];
    }>;
    updateRole(id: string, input: CreateRoleInput): Promise<{
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
    deleteRole(id: string): Promise<boolean>;
}
