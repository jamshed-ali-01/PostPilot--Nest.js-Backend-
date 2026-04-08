"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const mercurius_1 = require("@nestjs/mercurius");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const roles_module_js_1 = require("./modules/roles/roles.module.js");
const users_module_js_1 = require("./modules/users/users.module.js");
const businesses_module_js_1 = require("./modules/businesses/businesses.module.js");
const posts_module_js_1 = require("./modules/posts/posts.module.js");
const service_areas_module_js_1 = require("./modules/service-areas/service-areas.module.js");
const super_admin_module_js_1 = require("./modules/super-admin/super-admin.module.js");
const auth_module_js_1 = require("./modules/auth/auth.module.js");
const testimonials_module_js_1 = require("./modules/testimonials/testimonials.module.js");
const social_accounts_module_js_1 = require("./modules/social-accounts/social-accounts.module.js");
const subscription_plans_module_js_1 = require("./modules/subscription-plans/subscription-plans.module.js");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const app_resolver_js_1 = require("./app.resolver.js");
const stripe_module_js_1 = require("./modules/stripe/stripe.module.js");
const ads_module_js_1 = require("./modules/ads/ads.module.js");
const invitations_module_js_1 = require("./modules/invitations/invitations.module.js");
const mail_module_js_1 = require("./modules/mail/mail.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            graphql_1.GraphQLModule.forRootAsync({
                driver: mercurius_1.MercuriusDriver,
                useFactory: (configService) => ({
                    autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                    graphiql: configService.get('INTEGRATION_MODE') === 'true',
                    subscription: true,
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_js_1.PrismaModule,
            auth_module_js_1.AuthModule,
            roles_module_js_1.RolesModule,
            users_module_js_1.UsersModule,
            businesses_module_js_1.BusinessesModule,
            posts_module_js_1.PostsModule,
            service_areas_module_js_1.ServiceAreasModule,
            testimonials_module_js_1.TestimonialsModule,
            social_accounts_module_js_1.SocialAccountsModule,
            subscription_plans_module_js_1.SubscriptionPlansModule,
            super_admin_module_js_1.SuperAdminModule,
            stripe_module_js_1.StripeModule,
            ads_module_js_1.AdsModule,
            invitations_module_js_1.InvitationsModule,
            mail_module_js_1.MailModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [app_service_js_1.AppService, app_resolver_js_1.AppResolver],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map