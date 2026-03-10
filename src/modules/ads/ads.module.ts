import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsResolver } from './ads.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { PostsModule } from '../posts/posts.module';

@Module({
    imports: [PrismaModule, PostsModule],
    providers: [AdsService, AdsResolver],
    exports: [AdsService],
})
export class AdsModule { }
