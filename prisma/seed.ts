import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Permissions & Synchronization ---');

    // 1. Define Standard Permissions
    const permissionsList = [
        { name: 'CREATE_POST', description: 'Create new social media posts' },
        { name: 'EDIT_POST', description: 'Edit existing post drafts' },
        { name: 'DELETE_POST', description: 'Delete posts' },
        { name: 'PUBLISH_POST', description: 'Publish posts immediately to social media' },
        { name: 'SCHEDULE_POST', description: 'Schedule posts for future dates' },
        { name: 'VIEW_POSTS', description: 'View business posts' },
        { name: 'VIEW_ANALYTICS', description: 'View business performance metrics' },
        { name: 'VIEW_ADS', description: 'View social media ad campaigns' },
        { name: 'CREATE_AD', description: 'Create new ad campaigns' },
        { name: 'EDIT_AD', description: 'Modify ad campaigns' },
        { name: 'DELETE_AD', description: 'Delete ad campaigns' },
        { name: 'INVITE_USER', description: 'Invite new team members' },
        { name: 'REMOVE_USERS', description: 'Remove team members from the business' },
        { name: 'MANAGE_TEAM', description: 'Full team and permissions management' },
        { name: 'VIEW_TEAM', description: 'View team members' },
        { name: 'MANAGE_SETTINGS', description: 'Change business settings and profile' },
        { name: 'MANAGE_BILLING', description: 'Manage subscriptions and billing' },
        { name: 'MANAGE_INTEGRATIONS', description: 'Manage social platform connections' },
        { name: 'MANAGE_SERVICE_AREAS', description: 'Configure business service areas' },
        { name: 'ADMIN_SETTINGS', description: 'System-level admin settings' },
    ];

    const allPerms: any[] = [];
    for (const p of permissionsList) {
        const perm = await prisma.permission.upsert({
            where: { name: p.name },
            update: { description: p.description },
            create: p,
        });
        allPerms.push(perm);
    }
    const permMap = allPerms.reduce((acc, p) => ({ ...acc, [p.name]: p.id }), {});

    // Role Templates
    const rolesToSync = [
        {
            name: 'Business Manager',
            description: 'Can manage content, ads, and team, but restricted from sensitive settings and billing.',
            permissions: [
                'CREATE_POST', 'EDIT_POST', 'PUBLISH_POST', 'SCHEDULE_POST', 'VIEW_POSTS',
                'VIEW_ANALYTICS', 'VIEW_ADS', 'CREATE_AD', 'EDIT_AD',
                'INVITE_USER', 'VIEW_TEAM', 'MANAGE_INTEGRATIONS', 'MANAGE_SERVICE_AREAS'
            ].map(name => permMap[name]),
        },
        {
            name: 'Business Staff',
            description: 'Focus on content creation and performance monitoring.',
            permissions: [
                'CREATE_POST', 'VIEW_POSTS', 'VIEW_ANALYTICS', 'VIEW_TEAM'
            ].map(name => permMap[name]),
        },
    ];

    // 2. Global Roles
    console.log('Seeding Global Roles...');
    for (const r of rolesToSync) {
        const existingGlobal = await prisma.role.findFirst({
            where: { name: r.name, businessId: null }
        });
        if (existingGlobal) {
            await prisma.role.update({
                where: { id: existingGlobal.id },
                data: { permissionIds: r.permissions, description: r.description }
            });
        } else {
            await prisma.role.create({
                data: { name: r.name, businessId: null, description: r.description, permissionIds: r.permissions }
            });
        }
    }

    // 3. Sync Existing Businesses
    const businesses = await prisma.business.findMany();
    console.log(`Syncing ${businesses.length} businesses...`);

    for (const biz of businesses) {
        const bizId = biz.id;

        // Ensure Owner role has all permissions
        const ownerRole = await prisma.role.findFirst({
            where: { 
                OR: [
                    { name: `OWNER_${bizId}` },
                    { name: 'Business Owner', businessId: bizId }
                ]
            }
        });

        if (ownerRole) {
            await prisma.role.update({
                where: { id: ownerRole.id },
                data: { permissionIds: allPerms.map(p => p.id) }
            });
        }

        // Sync Manager and Staff
        for (const r of rolesToSync) {
            const existing = await prisma.role.findFirst({
                where: { name: r.name, businessId: bizId }
            });

            if (existing) {
                await prisma.role.update({
                    where: { id: existing.id },
                    data: { permissionIds: r.permissions, description: r.description }
                });
            } else {
                await prisma.role.create({
                    data: { name: r.name, businessId: bizId, description: r.description, permissionIds: r.permissions }
                });
            }
        }
    }

    console.log('--- Sync Successfully Completed ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
