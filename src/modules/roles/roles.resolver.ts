import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleInput } from './dto/create-role.input';

@Resolver(() => Role)
export class RolesResolver {
    constructor(private readonly rolesService: RolesService) { }
    // Forced schema update trigger

    @Mutation(() => Role)
    async createRole(@Args('input') input: CreateRoleInput) {
        return this.rolesService.create(input);
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard)
    async assignRoleToUser(
        @Args('userId', { type: () => ID }) userId: string,
        @Args('roleId', { type: () => ID }) roleId: string,
        @CurrentUser() user: any,
    ) {
        await this.rolesService.assignToUser(userId, roleId, user.id);
        return true;
    }

    @Query(() => [Role], { name: 'globalRoles' })
    async getGlobalRoles() {
        return this.rolesService.findAllGlobal();
    }

    @Query(() => [Role], { name: 'businessRoles' })
    async getBusinessRoles(@Args('businessId', { type: () => ID }) businessId: string) {
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

    @Mutation(() => Role)
    async updateRole(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: CreateRoleInput,
    ) {
        return this.rolesService.update(id, input);
    }

    @Mutation(() => Boolean)
    async deleteRole(@Args('id', { type: () => ID }) id: string) {
        await this.rolesService.delete(id);
        return true;
    }
}
