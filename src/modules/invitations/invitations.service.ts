import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvitationInput } from './dto/create-invitation.input';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
    constructor(private prisma: PrismaService) { }

    async create(input: CreateInvitationInput) {
        const { email, roleId, businessId } = input;

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email is already registered.');
        }

        // Check for existing pending invitation
        const existingInvite = await this.prisma.invitation.findFirst({
            where: { email, businessId, acceptedAt: null }
        });

        if (existingInvite && existingInvite.expiresAt > new Date()) {
            return existingInvite; // Re-use valid invite or we could resend/regenerate
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        return this.prisma.invitation.upsert({
            where: { email_businessId: { email, businessId } },
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
                businessId,
                expiresAt,
            },
        });
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
}
