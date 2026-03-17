import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const token = 'a02ae269047e62c7014d75f658df0f3241f7fc01923832ab7df812f70567bac1';

async function main() {
    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { business: true, role: true }
        });

        if (!invitation) {
            console.log('STATUS: NOT_FOUND');
            return;
        }

        const isExpired = invitation.expiresAt < new Date();
        const isAccepted = !!invitation.acceptedAt;

        console.log('STATUS: FOUND');
        console.log('EMAIL:', invitation.email);
        console.log('EXPIRED:', isExpired);
        console.log('ACCEPTED:', isAccepted);
        console.log('EXPIRES_AT:', invitation.expiresAt);
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
