import * as fastify from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
export declare class StripeController {
    private readonly prisma;
    private readonly authService;
    private readonly stripe;
    private readonly logger;
    constructor(prisma: PrismaService, authService: AuthService);
    handleWebhook(req: fastify.FastifyRequest, res: fastify.FastifyReply, signature: string, rawBody: Buffer): Promise<undefined>;
}
