import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { PostStatus } from '@prisma/client';
import { PostsService } from './posts.service.js';
import { Post } from './entities/post.entity.js';
import { BusinessAnalytics } from './entities/analytics.entity.js';
import { CreatePostInput } from './dto/create-post.input.js';
import { UpdatePostInput } from './dto/update-post.input.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard.js';
import { RbacGuard } from '../../common/guards/rbac.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) { }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async createPost(@Args('input') input: CreatePostInput) {
        return this.postsService.create(input);
    }

    @Query(() => [Post], { name: 'businessPosts' })
    async getBusinessPosts(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.postsService.findAllByBusiness(businessId);
    }

    @Query(() => [Post], { name: 'pendingPosts' })
    @UseGuards(GqlAuthGuard)
    async getPendingPosts(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.postsService.getPendingPosts(businessId);
    }

    @Query(() => Post, { name: 'post', nullable: true })
    async getPost(@Args('id', { type: () => ID }) id: string) {
        return this.postsService.findOne(id);
    }

    @Mutation(() => String)
    @UseGuards(GqlAuthGuard)
    async generateAIContent(
        @CurrentUser() user: any,
        @Args('prompt') prompt: string,
        @Args('tone', { nullable: true }) tone?: string,
        @Args('location', { nullable: true }) location?: string,
        @Args('imageUrls', { type: () => [String], nullable: true }) imageUrls?: string[],
    ) {
        return this.postsService.generateAIContent(user.id, prompt, tone, location, imageUrls);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async submitPostForApproval(@Args('id', { type: () => ID }) id: string) {
        return this.postsService.submitForApproval(id);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard, RbacGuard)
    @Permissions('PUBLISH_POST')
    async approvePost(
        @Args('id', { type: () => ID }) id: string,
        @Args('status', { type: () => PostStatus }) status: PostStatus,
    ) {
        return this.postsService.updateStatus(id, status);
    }

    @Query(() => BusinessAnalytics, { name: 'businessAnalytics' })
    @UseGuards(GqlAuthGuard, RbacGuard)
    async getBusinessAnalytics(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.postsService.getAnalytics(businessId);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async deletePost(@Args('id', { type: () => ID }) id: string) {
        return this.postsService.delete(id);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async updatePost(@Args('input') input: UpdatePostInput) {
        const { id, ...data } = input;
        return this.postsService.update(id, data);
    }

    @ResolveField('platforms', () => [String])
    async getPlatforms(@Parent() post: Post) {
        if (!post.platformIds || post.platformIds.length === 0) return [];
        const accounts = await this.postsService.getPlatformsByAccountIds(post.platformIds);
        return accounts.map(a => a.platform);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard)
    async syncPostMetrics(@Args('id', { type: () => ID }) id: string) {
        return this.postsService.syncPostMetrics(id);
    }

    @Mutation(() => BusinessAnalytics)
    @UseGuards(GqlAuthGuard)
    async syncBusinessAnalytics(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.postsService.syncAllBusinessMetrics(businessId);
    }

}
