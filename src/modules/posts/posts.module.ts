import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { AIService } from './ai.service';

@Module({
    providers: [PostsService, PostsResolver, AIService],
    exports: [PostsService],
})
export class PostsModule { }
