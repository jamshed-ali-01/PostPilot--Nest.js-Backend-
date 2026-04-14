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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let RbacGuard = class RbacGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.get(permissions_decorator_1.PERMISSIONS_KEY, context.getHandler());
        if (!requiredPermissions) {
            return true;
        }
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const contextObj = ctx.getContext();
        const user = contextObj.user ||
            contextObj.req?.user ||
            contextObj.request?.user ||
            contextObj.reply?.request?.user;
        if (!user) {
            return false;
        }
        if (user.isSystemAdmin) {
            return true;
        }
        const userPermissions = (user.roles || []).flatMap((role) => (role.permissions || []).map((p) => p.name));
        return requiredPermissions.every((permission) => userPermissions.includes(permission));
    }
};
exports.RbacGuard = RbacGuard;
exports.RbacGuard = RbacGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RbacGuard);
//# sourceMappingURL=rbac.guard.js.map