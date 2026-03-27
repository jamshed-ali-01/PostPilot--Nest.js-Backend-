"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding permissions and roles...');
    try {
        const mangerPerm = await prisma.permission.findFirst({
            where: { OR: [{ name: 'manger' }, { name: 'MANGER' }] }
        });
        if (mangerPerm) {
            await prisma.permission.delete({ where: { id: mangerPerm.id } });
            console.log('✅ Deleted misspelled permission: "manger"');
        }
    }
    catch (e) {
        console.log('ℹ️ Manger permission not found or already deleted.');
    }
    const perms = [
        { name: 'CREATE_AD', description: 'Can create meta ads' },
        { name: 'EDIT_AD', description: 'Can edit existing ads' },
        { name: 'DELETE_AD', description: 'Can delete ads' },
        { name: 'VIEW_ADS', description: 'Can view ads dashboard' },
        { name: 'CREATE_POST', description: 'Can create social posts' },
        { name: 'EDIT_POST', description: 'Can edit existing posts' },
        { name: 'DELETE_POST', description: 'Can delete posts' },
        { name: 'VIEW_POSTS', description: 'Can view posts dashboard' },
        { name: 'VIEW_ANALYTICS', description: 'Can view performance analytics' },
        { name: 'INVITE_USER', description: 'Can invite new team members' },
        { name: 'MANAGE_TEAM', description: 'Can change roles and remove members' },
        { name: 'VIEW_TEAM', description: 'Can view team members list' },
        { name: 'MANAGE_SETTINGS', description: 'Can update business settings' },
    ];
    const createdPerms = [];
    for (const perm of perms) {
        const p = await prisma.permission.upsert({
            where: { name: perm.name },
            update: { description: perm.description },
            create: perm,
        });
        createdPerms.push(p);
    }
    console.log(`✅ Upserted ${createdPerms.length} permissions.`);
    const roles = [
        {
            name: 'Business Owner',
            description: 'Full access to all modules and billing',
            permissions: createdPerms.map(p => p.name),
        },
        {
            name: 'Manager',
            description: 'Can manage ads, posts, and team invitations',
            permissions: [
                'CREATE_AD', 'EDIT_AD', 'VIEW_ADS',
                'CREATE_POST', 'EDIT_POST', 'VIEW_POSTS',
                'VIEW_ANALYTICS', 'VIEW_TEAM', 'INVITE_USER'
            ],
        },
        {
            name: 'Content Creator',
            description: 'Focuses on creating and editing content',
            permissions: [
                'CREATE_POST', 'EDIT_POST', 'VIEW_POSTS',
                'VIEW_ADS', 'CREATE_AD'
            ],
        },
        {
            name: 'Viewer',
            description: 'Read-only access to dashboard and reports',
            permissions: [
                'VIEW_ADS', 'VIEW_POSTS', 'VIEW_ANALYTICS'
            ],
        },
    ];
    for (const role of roles) {
        const existingRole = await prisma.role.findFirst({
            where: { name: role.name, businessId: null },
        });
        if (existingRole) {
            await prisma.role.update({
                where: { id: existingRole.id },
                data: {
                    description: role.description,
                    permissions: {
                        set: [],
                        connect: role.permissions.map(name => ({ name })),
                    },
                },
            });
            console.log(`✅ Updated global role: ${role.name}`);
        }
        else {
            await prisma.role.create({
                data: {
                    name: role.name,
                    description: role.description,
                    businessId: null,
                    permissions: {
                        connect: role.permissions.map(name => ({ name })),
                    },
                },
            });
            console.log(`✅ Created global role: ${role.name}`);
        }
    }
    console.log('✨ Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-roles.js.map