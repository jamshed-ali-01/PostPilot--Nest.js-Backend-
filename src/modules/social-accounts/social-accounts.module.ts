import { Module } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccountsResolver } from './social-accounts.resolver';
import { SocialAccountsController } from './social-accounts.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [SocialAccountsController],
    providers: [SocialAccountsService, SocialAccountsResolver],
    exports: [SocialAccountsService],
})
export class SocialAccountsModule { }
