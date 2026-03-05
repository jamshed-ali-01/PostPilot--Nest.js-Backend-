import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServiceAreasService } from './service-areas.service.js';
import { ServiceArea } from './entities/service-area.entity.js';
import { CreateServiceAreaInput } from './dto/create-service-area.input.js';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard.js';
import { RbacGuard } from '../../common/guards/rbac.guard.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';

@Resolver(() => ServiceArea)
export class ServiceAreasResolver {
    constructor(private readonly serviceAreasService: ServiceAreasService) { }

    @Mutation(() => ServiceArea)
    @UseGuards(GqlAuthGuard, RbacGuard)
    @Permissions('ADMIN_SETTINGS')
    async createServiceArea(@Args('input') input: CreateServiceAreaInput) {
        return this.serviceAreasService.create(input);
    }

    @Query(() => [ServiceArea], { name: 'businessServiceAreas' })
    async findAll(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.serviceAreasService.findAllByBusiness(businessId);
    }

    @Mutation(() => ServiceArea)
    @UseGuards(GqlAuthGuard, RbacGuard)
    @Permissions('ADMIN_SETTINGS')
    async removeServiceArea(@Args('id', { type: () => ID }) id: string) {
        return this.serviceAreasService.remove(id);
    }
}
