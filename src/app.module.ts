import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { BusinessesModule } from './modules/businesses/businesses.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { ServiceAreasModule } from './modules/service-areas/service-areas.module.js';
import { SuperAdminModule } from './modules/super-admin/super-admin.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TestimonialsModule } from './modules/testimonials/testimonials.module.js';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module.js';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppResolver } from './app.resolver.js';
import { StripeModule } from './modules/stripe/stripe.module.js';
import { AdsModule } from './modules/ads/ads.module.js';
import { InvitationsModule } from './modules/invitations/invitations.module.js';
import { MailModule } from './modules/mail/mail.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        graphiql: configService.get<string>('INTEGRATION_MODE') === 'true',
        subscription: true,
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    RolesModule,
    UsersModule,
    BusinessesModule,
    PostsModule,
    ServiceAreasModule,
    TestimonialsModule,
    SocialAccountsModule,
    SubscriptionPlansModule,
    SuperAdminModule,
    StripeModule,
    AdsModule,
    InvitationsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule { }
