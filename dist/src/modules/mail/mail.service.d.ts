import { PrismaService } from '../../prisma/prisma.service.js';
export declare class MailService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private getTransporter;
    sendInvitationEmail(to: string, businessName: string, inviteLink: string): Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo | undefined>;
}
