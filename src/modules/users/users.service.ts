import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}
