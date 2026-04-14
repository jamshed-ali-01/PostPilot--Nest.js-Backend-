"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_service_1 = require("./auth.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    usersService;
    prisma;
    authService;
    constructor(configService, usersService, prisma, authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'default_secret_change_me',
        });
        this.configService = configService;
        this.usersService = usersService;
        this.prisma = prisma;
        this.authService = authService;
    }
    async validate(payload) {
        const sysAdmin = await this.prisma.systemAdmin.findUnique({
            where: { email: payload.email }
        });
        let user = await this.usersService.findByEmail(payload.email);
        if (sysAdmin && !user) {
            user = await this.authService.ensureAdminUserRecord(payload.email);
        }
        if (sysAdmin && user) {
            return { ...user, ...sysAdmin, isSystemAdmin: true };
        }
        if (sysAdmin)
            return { ...sysAdmin, isSystemAdmin: true };
        if (user)
            return { ...user, isSystemAdmin: false };
        throw new common_1.UnauthorizedException();
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map