import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    include: { permissions: true }
  });

  const perms = await prisma.permission.findMany();

  console.log('| Permission | ' + roles.map(r => r.name).join(' | ') + ' |');
  console.log('| --- | ' + roles.map(() => '---').join(' | ') + ' |');

  for (const p of perms) {
    let row = `| ${p.name} | `;
    for (const r of roles) {
      const hasPerm = r.permissions.some(rp => rp.id === p.id);
      row += (hasPerm ? '✅' : '❌') + ' | ';
    }
    console.log(row);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
