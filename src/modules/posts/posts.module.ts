import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { AIService } from './ai.service';
import { SchedulingService } from './scheduling.service.js';

import { SocialAccountsModule } from '../social-accounts/social-accounts.module';

@Module({
    imports: [SocialAccountsModule],
    providers: [PostsService, PostsResolver, AIService, SchedulingService],
    exports: [PostsService, AIService],
})
export class PostsModule { }
