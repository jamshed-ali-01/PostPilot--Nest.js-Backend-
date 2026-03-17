import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import * as fs from 'fs';
import { CreateInvitationInput } from './dto/create-invitation.input.js';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async create(input: CreateInvitationInput) {
        const { roleId, businessId } = input;
        const email = input.email.toLowerCase().trim();

        // Fetch business name for the email
        const business = await this.prisma.business.findUnique({ where: { id: businessId } });
        if (!business) throw new NotFoundException('Business not found');

        // Check if the role is restricted (Business Owner)
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) throw new NotFoundException('Role not found');
        
        if (role.name === 'Business Owner' || role.name.startsWith('OWNER_')) {
            throw new BadRequestException('The "Business Owner" role cannot be invited. It is uniquely assigned during registration.');
        }

        // Check if user is already a System Admin
        const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email } });
        if (sysAdmin) {
            throw new ConflictException('User with this email is a System Admin.');
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.businessId === businessId) {
                throw new ConflictException('User is already a member of this team.');
            }
            // If they are in another business, we allow inviting them to this business 
            // (Note: The current schema linked user to one business, so this might need careful handling 
            // but for now we block any existing user to be safe as per user request to avoid duplicates)
            throw new ConflictException('User with this email is already registered.');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await this.prisma.invitation.upsert({
            where: { email_businessId: { email, businessId: businessId! } },
            update: {
                token,
                roleId,
                expiresAt,
                acceptedAt: null,
            },
            create: {
                token,
                email,
                roleId,
                businessId: businessId!,
                expiresAt,
            },
        });

        // Send Email
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register/invite?token=${token}`;
        await this.mailService.sendInvitationEmail(email, business.name, inviteLink);

        return invitation;
    }

    async findByToken(token: string) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
            include: { business: true, role: true }
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found.');
        }

        if (invitation.acceptedAt) {
            throw new BadRequestException('Invitation has already been accepted.');
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation has expired.');
        }

        return invitation;
    }

    async accept(token: string) {
        return this.prisma.invitation.update({
            where: { token },
            data: { acceptedAt: new Date() },
        });
    }

    async findByBusiness(businessId: string) {
        const logMsg = `[InvitationsService] Finding invitations for businessId: "${businessId}" at ${new Date().toISOString()}\n`;
        fs.appendFileSync('team-debug.log', logMsg);
        const result = await this.prisma.invitation.findMany({
            where: { businessId, acceptedAt: null },
            include: { role: true },
            orderBy: { createdAt: 'desc' }
        });
        fs.appendFileSync('team-debug.log', `[InvitationsService] Found ${result.length} invitations\n`);
        return result;
    }

    async deleteInvitation(id: string, businessId: string) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id }
        });

        if (!invitation) throw new NotFoundException('Invitation not found');
        if (invitation.businessId !== businessId) throw new BadRequestException('Unauthorized');

        return this.prisma.invitation.delete({
            where: { id }
        });
    }
}
