import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const token = 'a02ae269047e62c7014d75f658df0f3241f7fc01923832ab7df812f70567bac1';

async function main() {
    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: { business: true, role: true }
    });

    console.log('Invitation:', JSON.stringify(invitation, null, 2));
    
    if (invitation) {
        console.log('Expired:', invitation.expiresAt < new Date());
        console.log('Accepted At:', invitation.acceptedAt);
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
