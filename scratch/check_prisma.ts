import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPrismaModels() {
    console.log("=== PRISMA MODELS ===");
    const props = Object.keys(prisma);
    const models = props.filter(p => !p.startsWith('_') && !p.startsWith('$'));
    console.log(models);
}

checkPrismaModels();
