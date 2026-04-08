import { Resolver, Mutation, Args, ObjectType, Field, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput, ResetPasswordInput } from './dto/auth-inputs.js';
import { User } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
export class AuthUser {
    @Field()
    id: string;

    @Field()
    email: string;

    @Field({ nullable: true })
    firstName?: string;

    @Field({ nullable: true })
    lastName?: string;

    @Field({ nullable: true })
    name?: string;

    @Field(() => Boolean, { defaultValue: false })
    isSystemAdmin: boolean;

    @Field({ nullable: true })
    businessId?: string;

    @Field(() => Business, { nullable: true })
    business?: Business;

    @Field({ nullable: true })
    aiTone?: string;

    @Field(() => [String], { nullable: true })
    aiHashtags?: string[];

    @Field({ nullable: true })
    aiCaptionLength?: string;

    @Field({ nullable: true })
    aiIncludeEmojis?: boolean;

    @Field(() => [String], { nullable: true })
    permissions?: string[];

    @Field(() => [RoleDto], { nullable: true })
    roles?: RoleDto[];
}

@ObjectType()
class RoleDto {
    @Field()
    id: string;

    @Field()
    name: string;
}

@ObjectType()
class AuthResponse {
    @Field()
    access_token: string;

    @Field(() => AuthUser)
    user: AuthUser;

    @Field({ nullable: true })
    stripeUrl?: string;
}

@ObjectType()
class AuthInitiateResponse {
    @Field()
    stripeUrl: string;
}

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) { }

    @Mutation(() => AuthResponse)
    async login(@Args('input') loginInput: LoginInput) {
        return this.authService.login(loginInput);
    }

    @Mutation(() => AuthInitiateResponse)
    async initiateRegister(@Args('input') registerInput: RegisterInput) {
        return this.authService.initiateRegister(registerInput);
    }

    @Mutation(() => User)
    async registerByInvite(
        @Args('input') input: RegisterInput,
        @Args('token') token: string,
    ) {
        return this.authService.registerByInvite(input, token);
    }

    @Query(() => AuthUser, { name: 'me' })
    @UseGuards(GqlAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return this.authService.getMe(user.id);
    }

    @Mutation(() => Boolean)
    async confirmRegistration(@Args('sessionId') sessionId: string) {
        return this.authService.confirmRegistrationBySession(sessionId);
    }

    @Mutation(() => Boolean)
    async sendOtp(@Args('email') email: string) {
        return this.authService.sendOtp(email);
    }

    @Mutation(() => Boolean)
    async verifyOtp(
        @Args('email') email: string,
        @Args('code') code: string
    ) {
        return this.authService.verifyOtp(email, code);
    }

    @Mutation(() => Boolean)
    async sendResetPasswordOtp(@Args('email') email: string) {
        return this.authService.sendResetPasswordOtp(email);
    }

    @Mutation(() => Boolean)
    async resetPassword(@Args('input') input: ResetPasswordInput) {
        return this.authService.resetPassword(input.email, input.otp, input.newPassword);
    }
}
