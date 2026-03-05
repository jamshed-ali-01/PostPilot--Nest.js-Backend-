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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'jamshedlinkedin@gmail.com';
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log('User found in User table:', user);
        const hashedPassword = await bcrypt.hash('a', 10);
        console.log('Upserting SystemAdmin jamshedlinkedin@gmail.com with fresh password hash for "a"');
        const sysAdmin = await prisma.systemAdmin.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'jamshed ali',
            },
            create: {
                email,
                password: hashedPassword,
                name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'jamshed ali',
            }
        });
        console.log('SystemAdmin successfully configured:', sysAdmin.email);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=setup-admin.js.map