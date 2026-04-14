import { PrismaService } from '../../prisma/prisma.service.js';
export declare class MailService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private sendMail;
    private sendViaSES;
    private sendViaSMTP;
    sendInvitationEmail(to: string, businessName: string, inviteLink: string): Promise<{
        messageId: string | undefined;
    } | undefined>;
    sendOtpEmail(to: string, otp: string): Promise<{
        messageId: string | undefined;
    }>;
    sendResetPasswordEmail(to: string, otp: string): Promise<{
        messageId: string | undefined;
    }>;
}
