import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { InvitationsService } from './invitations.service';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationInput } from './dto/create-invitation.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';

@Resolver(() => Invitation)
export class InvitationsResolver {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Mutation(() => Invitation)
    @UseGuards(GqlAuthGuard)
    async createInvitation(@Args('input') input: CreateInvitationInput) {
        return this.invitationsService.create(input);
    }

    @Query(() => Invitation)
    async getInvitation(@Args('token') token: string) {
        return this.invitationsService.findByToken(token);
    }
}
