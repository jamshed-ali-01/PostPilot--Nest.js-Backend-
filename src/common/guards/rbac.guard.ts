import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.get<string[]>(
            PERMISSIONS_KEY,
            context.getHandler(),
        );
        if (!requiredPermissions) {
            return true;
        }

        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().user; // We assume user is attached here by an AuthGuard or Middleware

        if (!user) {
            return false;
        }

        // System Admins have all permissions
        if (user.isSystemAdmin) {
            return true;
        }

        // Check if user has all required permissions
        const userPermissions = (user.roles || []).flatMap((role: any) =>
            (role.permissions || []).map((p: any) => p.name),
        );

        return requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );
    }
}
