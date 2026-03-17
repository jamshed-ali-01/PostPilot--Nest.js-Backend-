import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { InvitationsService } from './invitations.service.js';
import { Invitation } from './entities/invitation.entity.js';
import { CreateInvitationInput } from './dto/create-invitation.input.js';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { BadRequestException } from '@nestjs/common';

@Resolver(() => Invitation)
export class InvitationsResolver {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Mutation(() => Invitation)
    @UseGuards(GqlAuthGuard)
    async createInvitation(
        @Args('input') input: CreateInvitationInput,
        @CurrentUser() user: any
    ) {
        // If businessId is not provided (e.g. from Team page), infer it from the user
        if (!input.businessId) {
            if (!user.businessId) {
                throw new BadRequestException('Business ID is required for invitations.');
            }
            input.businessId = user.businessId;
        }
        return this.invitationsService.create(input);
    }

    @Query(() => Invitation)
    async getInvitation(@Args('token') token: string) {
        return this.invitationsService.findByToken(token);
    }

    @Query(() => [Invitation])
    @UseGuards(GqlAuthGuard)
    async businessInvitations(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.invitationsService.findByBusiness(businessId);
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlAuthGuard)
    async cancelInvitation(
        @Args('id', { type: () => ID }) id: string,
        @CurrentUser() user: any
    ) {
        await this.invitationsService.deleteInvitation(id, user.businessId);
        return true;
    }
}
