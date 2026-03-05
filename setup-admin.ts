import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'jamshedlinkedin@gmail.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        console.log('User found in User table:', user);
        // Strictly hash the exact password 'a' the user reported
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
