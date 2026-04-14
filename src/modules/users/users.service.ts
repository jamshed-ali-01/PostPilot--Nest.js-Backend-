import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';

// Assuming UpdateAiPreferencesInput is defined elsewhere or needs to be added.
// For the purpose of this edit, we'll assume it's a type that maps to the properties
// expected by the updateAiPreferences method. If it's not defined, this will cause a type error.
// For example:
// interface UpdateAiPreferencesInput {
//     tone?: string;
//     hashtags?: string[];
//     captionLength?: string;
//     includeEmojis?: boolean;
// }

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string) {
        const normalizedEmail = email.toLowerCase().trim();
        return this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                business: true,
                roles: { include: { permissions: true } }
            },
        });
    }

    async create(data: { email: string, password: string, businessId: string, firstName?: string, lastName?: string, roleIds?: string[] }) {
        return this.prisma.user.create({
            data,
            include: {
                business: true,
                roles: { include: { permissions: true } }
            },
        });
    }

    async updateAiPreferences(userId: string, data: { aiTone?: string, aiHashtags?: string[], aiCaptionLength?: string, aiIncludeEmojis?: boolean }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async findAllByBusiness(businessId: string) {
        const logMsg = `[UsersService] Finding all users for businessId: "${businessId}" at ${new Date().toISOString()}\n`;
        fs.appendFileSync('team-debug.log', logMsg);
        const result = await this.prisma.user.findMany({
            where: { businessId },
            include: { roles: true }
        });
        fs.appendFileSync('team-debug.log', `[UsersService] Found ${result.length} users\n`);
        return result;
    }

    async removeUser(userId: string, businessId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true }
        });

        if (!user) throw new Error('User not found');
        
        const targetBusinessId = user.businessId ? user.businessId.toString() : 'undefined';
        const requestingBusinessId = businessId ? businessId.toString() : 'undefined';

        const logMsg = `[UsersService] Attempting to remove user ${userId}. Target user businessId: ${targetBusinessId}, Requesting businessId: ${requestingBusinessId} at ${new Date().toISOString()}\n`;
        fs.appendFileSync('team-debug.log', logMsg);
        
        if (!user.businessId || !businessId || targetBusinessId !== requestingBusinessId) {
            fs.appendFileSync('team-debug.log', `[UsersService] Unauthorized removal attempt: ${targetBusinessId} !== ${requestingBusinessId}\n`);
            throw new Error('Unauthorized');
        }

        // Prevent removing the owner
        const isOwner = user.roles.some(r => r.name === 'Business Owner' || r.name.startsWith('OWNER_'));
        if (isOwner) {
            throw new Error('The Business Owner cannot be removed from the team.');
        }

        return this.prisma.user.delete({
            where: { id: userId }
        });
    }
}
