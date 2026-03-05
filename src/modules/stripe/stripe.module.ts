import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeResolver } from './stripe.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  providers: [StripeService, StripeResolver],
  controllers: [StripeController],
  exports: [StripeService]
})
export class StripeModule { }
