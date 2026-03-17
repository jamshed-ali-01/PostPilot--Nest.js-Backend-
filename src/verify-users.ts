import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { roles: true }
  });

  console.log('--- ALL USERS ---');
  for (const u of users) {
      console.log(JSON.stringify({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          businessId: u.businessId,
          roles: u.roles.map(r => r.name)
      }, null, 2));
  }

  const invites = await prisma.invitation.findMany({
    include: { role: true, business: true }
  });
  console.log('\n--- ALL INVITATIONS ---');
  for (const i of invites) {
      console.log(JSON.stringify({
          from: i.business?.name,
          to: i.email,
          role: i.role?.name,
          acceptedAt: i.acceptedAt
      }, null, 2));
  }

  const sysAdmins = await prisma.systemAdmin.findMany();
  console.log('\n--- SYSTEM ADMINS ---');
  for (const s of sysAdmins) {
      console.log(JSON.stringify({
          id: s.id,
          email: s.email,
          name: s.name
      }, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
