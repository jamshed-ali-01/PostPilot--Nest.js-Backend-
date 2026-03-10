import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccount } from './entities/social-account.entity';
import { ConnectSocialAccountInput } from './dto/social-account-inputs';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => SocialAccount)
@UseGuards(GqlAuthGuard)
export class SocialAccountsResolver {
    constructor(private readonly socialAccountsService: SocialAccountsService) { }

    @Query(() => [SocialAccount])
    async socialAccounts(@CurrentUser() user: any) {
        const busId = user?.businessId || user?.business?.id;
        if (!busId && !user?.isSystemAdmin) return [];
        return this.socialAccountsService.findAllByBusiness(busId);
    }

    @Query(() => String, { name: 'socialAccountAuthUrl' })
    async getAuthUrl(
        @CurrentUser() user: any,
        @Args('platform') platform: string,
    ) {
        const busId = user?.businessId || user?.business?.id;
        console.log(`[SocialAccountsResolver] getAuthUrl called for platform: ${platform}, user:`, { id: user?.id, businessId: busId, type: user?.isSystemAdmin ? 'Admin' : 'BusinessUser' });
        if (!busId && !user?.isSystemAdmin) throw new Error('Unauthorized');
        return this.socialAccountsService.getAuthUrl(busId, platform);
    }

    @Mutation(() => SocialAccount)
    async connectSocialAccount(
        @CurrentUser() user: any,
        @Args('input') input: ConnectSocialAccountInput,
    ) {
        const busId = user?.businessId || user?.business?.id;
        if (!busId && !user?.isSystemAdmin) throw new Error('Only business users or admins can connect accounts');
        return this.socialAccountsService.connectAccount(busId, input);
    }

    @Mutation(() => SocialAccount)
    async disconnectSocialAccount(@Args('id') id: string) {
        return this.socialAccountsService.disconnect(id);
    }
}
