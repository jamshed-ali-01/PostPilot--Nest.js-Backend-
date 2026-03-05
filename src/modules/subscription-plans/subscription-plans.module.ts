import { Module } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { SubscriptionPlansResolver } from './subscription-plans.resolver';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [SubscriptionPlansResolver, SubscriptionPlansService],
    exports: [SubscriptionPlansService]
})
export class SubscriptionPlansModule { }
