import { PrismaService } from '../../prisma/prisma.service';
import { RegisterInput } from '../auth/dto/auth-inputs';
export declare class StripeService {
    private readonly prisma;
    private readonly stripe;
    private readonly logger;
    constructor(prisma: PrismaService);
    createCheckoutSession(businessId: string, planId: string, email?: string): Promise<string>;
    createCheckoutSessionForRegistration(input: RegisterInput, hashedPassword: string): Promise<string>;
}
