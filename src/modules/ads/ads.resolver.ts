import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AdsService } from './ads.service';
import { Ad } from './entities/ad.entity';
import { CreateAdInput } from './dto/create-ad.input';
import { AIAdResult } from './entities/ad-ai-result.entity';
import { FbAdAccount, FbPage } from './entities/fb-metadata.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => Ad)
export class AdsResolver {
    constructor(private readonly adsService: AdsService) { }

    @Mutation(() => Ad)
    @UseGuards(GqlAuthGuard)
    async createAd(@Args('input') input: CreateAdInput) {
        return this.adsService.create(input);
    }

    @Query(() => [Ad], { name: 'businessAds' })
    @UseGuards(GqlAuthGuard)
    async getBusinessAds(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.adsService.findAllByBusiness(businessId);
    }

    @Query(() => [FbAdAccount], { name: 'facebookAdAccounts' })
    @UseGuards(GqlAuthGuard)
    async getFacebookAdAccounts(
        @CurrentUser() user: any,
        @Args('businessId', { type: () => ID, nullable: true }) businessId?: string
    ) {
        const idToSearch = businessId === 'admin' ? null : businessId;
        return this.adsService.getFacebookAdAccounts(idToSearch);
    }

    @Query(() => [FbPage], { name: 'facebookPages' })
    @UseGuards(GqlAuthGuard)
    async getFacebookPages(
        @CurrentUser() user: any,
        @Args('businessId', { type: () => ID, nullable: true }) businessId?: string
    ) {
        const idToSearch = businessId === 'admin' ? null : businessId;
        return this.adsService.getFacebookPages(idToSearch);
    }

    @Mutation(() => AIAdResult)
    @UseGuards(GqlAuthGuard)
    async generateAIAd(
        @CurrentUser() user: any,
        @Args('prompt') prompt: string,
        @Args('platform', { defaultValue: 'FACEBOOK' }) platform: string,
    ) {
        return this.adsService.generateAIAd(user.id, prompt, platform);
    }

    @Mutation(() => Ad)
    @UseGuards(GqlAuthGuard)
    async deleteAd(@Args('id', { type: () => ID }) id: string) {
        return this.adsService.delete(id);
    }
}
