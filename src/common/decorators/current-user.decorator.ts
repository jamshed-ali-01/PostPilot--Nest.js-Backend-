import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context);
        const contextObj = ctx.getContext();
        // For Fastify/Mercurius, the user is typically attached to the request
        return contextObj.user || (contextObj.reply?.request?.user);
    },
);
