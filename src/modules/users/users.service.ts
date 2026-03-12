import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
        return this.prisma.user.findUnique({
            where: { email },
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
                roles: true
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
        return this.prisma.user.findMany({
            where: { businessId },
            include: { roles: true }
        });
    }
}
