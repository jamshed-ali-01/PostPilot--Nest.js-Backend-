import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleInput } from './dto/create-role.input';

@Resolver(() => Role)
export class RolesResolver {
    constructor(private readonly rolesService: RolesService) { }

    @Mutation(() => Role)
    async createRole(@Args('input') input: CreateRoleInput) {
        return this.rolesService.create(input);
    }

    @Mutation(() => Boolean)
    async assignRoleToUser(
        @Args('userId') userId: string,
        @Args('roleId') roleId: string,
    ) {
        await this.rolesService.assignToUser(userId, roleId);
        return true;
    }

    @Query(() => [Role], { name: 'globalRoles' })
    async getGlobalRoles() {
        return this.rolesService.findAllGlobal();
    }

    @Query(() => [Role], { name: 'businessRoles' })
    async getBusinessRoles(@Args('businessId') businessId: string) {
        return this.rolesService.findAllByBusiness(businessId);
    }

    @Query(() => [Permission], { name: 'permissions' })
    async getPermissions() {
        return this.rolesService.findPermissions();
    }

    @Mutation(() => Permission)
    async createPermission(
        @Args('name') name: string,
        @Args('description', { nullable: true }) description?: string,
    ) {
        return this.rolesService.createPermission(name, description);
    }
}
