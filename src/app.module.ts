import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { PostsModule } from './modules/posts/posts.module';
import { ServiceAreasModule } from './modules/service-areas/service-areas.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { StripeModule } from './modules/stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule { }
