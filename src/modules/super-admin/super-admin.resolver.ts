import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service.js';
import { Business } from '../businesses/entities/business.entity.js';
import { User } from '../users/entities/user.entity.js';
import { GlobalStats } from './entities/global-stats.entity.js';
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
}
