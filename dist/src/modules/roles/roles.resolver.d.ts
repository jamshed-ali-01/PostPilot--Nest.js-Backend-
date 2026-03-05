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
    assignRoleToUser(userId: string, roleId: string): Promise<boolean>;
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
    getBusinessRoles(businessId: string): Promise<({
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
}
