"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
const mail_service_js_1 = require("../mail/mail.service.js");
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
let InvitationsService = class InvitationsService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async create(input) {
        const { roleId, businessId } = input;
        const email = input.email.toLowerCase().trim();
        const business = await this.prisma.business.findUnique({ where: { id: businessId } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (role.name === 'Business Owner' || role.name.startsWith('OWNER_')) {
            throw new common_1.BadRequestException('The "Business Owner" role cannot be invited. It is uniquely assigned during registration.');
        }
        const sysAdmin = await this.prisma.systemAdmin.findUnique({ where: { email } });
        if (sysAdmin) {
            throw new common_1.ConflictException('User with this email is a System Admin.');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.businessId === businessId) {
                throw new common_1.ConflictException('User is already a member of this team.');
            }
            throw new common_1.ConflictException('User with this email is already registered.');
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const invitation = await this.prisma.invitation.upsert({
            where: { email_businessId: { email, businessId: businessId } },
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
                businessId: businessId,
                expiresAt,
            },
        });
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register/invite?token=${token}`;
        await this.mailService.sendInvitationEmail(email, business.name, inviteLink);
        return invitation;
    }
    async findByToken(token) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
            include: { business: true, role: true }
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found.');
        }
        if (invitation.acceptedAt) {
            throw new common_1.BadRequestException('Invitation has already been accepted.');
        }
        if (invitation.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invitation has expired.');
        }
        return invitation;
    }
    async accept(token) {
        return this.prisma.invitation.update({
            where: { token },
            data: { acceptedAt: new Date() },
        });
    }
    async findByBusiness(businessId) {
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
    async deleteInvitation(id, businessId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id }
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        if (invitation.businessId !== businessId)
            throw new common_1.BadRequestException('Unauthorized');
        return this.prisma.invitation.delete({
            where: { id }
        });
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        mail_service_js_1.MailService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map