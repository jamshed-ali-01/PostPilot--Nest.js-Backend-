"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const token = 'a02ae269047e62c7014d75f658df0f3241f7fc01923832ab7df812f70567bac1';
async function main() {
    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { business: true, role: true }
    });
    if (!invitation) {
        console.log('TOKEN_NOT_FOUND');
    }
    else {
        const now = new Date();
        console.log('TOKEN_FOUND');
        console.log('EMAIL:', invitation.email);
        console.log('ACCEPTED_AT:', invitation.acceptedAt);
        console.log('EXPIRES_AT:', invitation.expiresAt);
        console.log('IS_EXPIRED:', invitation.expiresAt < now);
        console.log('NOW:', now);
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=debug-token-v3.js.map