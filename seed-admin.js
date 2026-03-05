const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Create System Admin
    const adminEmail = 'admin@postpilot.com';
    const adminPassword = 'AdminPassword123!';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await prisma.systemAdmin.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        await prisma.systemAdmin.create({
            data: {
                email: adminEmail,
                password: hashedAdminPassword,
                name: 'Global Admin',
            }
        });
        console.log('System Admin created:', adminEmail);
    } else {
        console.log('System Admin already exists.');
    }

    // 2. Create Permissions
    const permissions = [
        { name: 'CREATE_POST', description: 'Can create and edit posts' },
        { name: 'PUBLISH_POST', description: 'Can publish posts directly' },
        { name: 'VIEW_ANALYTICS', description: 'Can view business analytics' },
        { name: 'ADMIN_SETTINGS', description: 'Can manage business settings and team' },
    ];

    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        });
    }
    console.log('Permissions seeded.');

    // 3. Create a Demo Business
    const bizName = "John's Plumbing";
    const bizEmail = 'owner@johnsplumbing.com';
    const bizPassword = 'OwnerPassword123!';
    const hashedBizPassword = await bcrypt.hash(bizPassword, 10);

    let business = await prisma.business.findFirst({ where: { name: bizName } });
    if (!business) {
        business = await prisma.business.create({
            data: {
                name: bizName,
            }
        });
        console.log('Business created:', bizName);
    }

    // 4. Create Owner Role for this business
    const allPerms = await prisma.permission.findMany();
    const ownerRoleName = `OWNER_${business.id}`;

    let ownerRole = await prisma.role.findFirst({ where: { name: ownerRoleName } });
    if (!ownerRole) {
        ownerRole = await prisma.role.create({
            data: {
                name: ownerRoleName,
                description: 'Full access to business settings',
                businessId: business.id,
                permissions: {
                    connect: allPerms.map(p => ({ id: p.id }))
                }
            }
        });
        console.log('Owner role created.');
    }

    // 5. Create Business User (Owner)
    const existingUser = await prisma.user.findUnique({ where: { email: bizEmail } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                email: bizEmail,
                password: hashedBizPassword,
                firstName: 'John',
                lastName: 'Smith',
                businessId: business.id,
                roleIds: [ownerRole.id]
            }
        });
        console.log('Business Owner user created:', bizEmail);
    }

    console.log('Seed finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
