import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service.js';
import { Business } from '../businesses/entities/business.entity.js';
import { User } from '../users/entities/user.entity.js';
import { GlobalStats } from './entities/global-stats.entity.js';
import { SystemSettings } from './entities/system-settings.entity.js';
import { UpdateSystemSettingsInput } from './dto/update-system-settings.input.js';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard.js';
import { RbacGuard } from '../../common/guards/rbac.guard.js';

@Resolver()
@UseGuards(GqlAuthGuard, RbacGuard)
export class SuperAdminResolver {
    constructor(private readonly superAdminService: SuperAdminService) { }

    @Query(() => [Business], { name: 'adminAllBusinesses' })
    async getAllBusinesses() {
        return this.superAdminService.getAllBusinesses();
    }

    @Query(() => [User], { name: 'adminAllUsers' })
    async getAllUsers() {
        return this.superAdminService.getAllUsers();
    }

    @Query(() => GlobalStats, { name: 'adminGlobalStats' })
    async getGlobalStats() {
        return this.superAdminService.getGlobalStats();
    }

    @Query(() => [SystemSettings], { name: 'adminSystemSettings' })
    async getSystemSettings() {
        return this.superAdminService.getSystemSettings();
    }

    @Mutation(() => SystemSettings, { name: 'adminUpdateSystemSettings' })
    async updateSystemSettings(@Args('input') input: UpdateSystemSettingsInput) {
        return this.superAdminService.updateSystemSettings(input);
    }

    @Mutation(() => Business, { name: 'toggleActiveStatus' })
    async toggleActiveStatus(
        @Args('businessId') businessId: string,
        @Args('isActive') isActive: boolean,
    ) {
        return this.superAdminService.toggleActiveStatus(businessId, isActive);
    }

    @Mutation(() => Business, { name: 'toggleBusinessSubscription' })
    async toggleBusinessSubscription(
        @Args('businessId') businessId: string,
        @Args('isSubscriptionActive') isSubscriptionActive: boolean,
    ) {
        return this.superAdminService.toggleBusinessSubscription(businessId, isSubscriptionActive);
    }

    @Mutation(() => Boolean, { name: 'deleteBusiness' })
    async deleteBusiness(@Args('businessId') businessId: string) {
        return this.superAdminService.deleteBusiness(businessId);
    }
}
