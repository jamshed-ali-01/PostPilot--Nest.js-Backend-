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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs = __importStar(require("fs"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        return this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                business: true,
                roles: { include: { permissions: true } }
            },
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data,
            include: {
                business: true,
                roles: true
            },
        });
    }
    async updateAiPreferences(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    async findAllByBusiness(businessId) {
        const logMsg = `[UsersService] Finding all users for businessId: "${businessId}" at ${new Date().toISOString()}\n`;
        fs.appendFileSync('team-debug.log', logMsg);
        const result = await this.prisma.user.findMany({
            where: { businessId },
            include: { roles: true }
        });
        fs.appendFileSync('team-debug.log', `[UsersService] Found ${result.length} users\n`);
        return result;
    }
    async removeUser(userId, businessId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true }
        });
        if (!user)
            throw new Error('User not found');
        const targetBusinessId = user.businessId ? user.businessId.toString() : 'undefined';
        const requestingBusinessId = businessId ? businessId.toString() : 'undefined';
        const logMsg = `[UsersService] Attempting to remove user ${userId}. Target user businessId: ${targetBusinessId}, Requesting businessId: ${requestingBusinessId} at ${new Date().toISOString()}\n`;
        fs.appendFileSync('team-debug.log', logMsg);
        if (!user.businessId || !businessId || targetBusinessId !== requestingBusinessId) {
            fs.appendFileSync('team-debug.log', `[UsersService] Unauthorized removal attempt: ${targetBusinessId} !== ${requestingBusinessId}\n`);
            throw new Error('Unauthorized');
        }
        const isOwner = user.roles.some(r => r.name === 'Business Owner' || r.name.startsWith('OWNER_'));
        if (isOwner) {
            throw new Error('The Business Owner cannot be removed from the team.');
        }
        return this.prisma.user.delete({
            where: { id: userId }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map