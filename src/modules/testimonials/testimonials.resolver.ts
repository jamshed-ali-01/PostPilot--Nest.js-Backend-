import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TestimonialsService } from './testimonials.service.js';
import { Testimonial } from './entities/testimonial.entity.js';
import { CreateTestimonialInput } from './dto/create-testimonial.input.js';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard.js';
import { RbacGuard } from '../../common/guards/rbac.guard.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Post } from '../posts/entities/post.entity.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Resolver(() => Testimonial)
export class TestimonialsResolver {
    constructor(private readonly testimonialsService: TestimonialsService) { }

    @Mutation(() => Testimonial)
    async submitTestimonial(@Args('input') input: CreateTestimonialInput) {
        // This is a public endpoint
        return this.testimonialsService.create(input);
    }

    @Query(() => [Testimonial], { name: 'businessTestimonials' })
    @UseGuards(GqlAuthGuard, RbacGuard)
    @Permissions('VIEW_ANALYTICS')
    async findAll(@Args('businessId', { type: () => ID }) businessId: string) {
        return this.testimonialsService.findAllByBusiness(businessId);
    }

    @Mutation(() => Post)
    @UseGuards(GqlAuthGuard, RbacGuard)
    @Permissions('CREATE_POST')
    async approveTestimonial(
        @Args('id', { type: () => ID }) id: string,
        @CurrentUser() user: any,
    ) {
        return this.testimonialsService.approveAndConvertToPost(id, user.id);
    }
}
