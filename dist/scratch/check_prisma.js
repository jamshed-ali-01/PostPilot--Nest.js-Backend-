"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkPrismaModels() {
    console.log("=== PRISMA MODELS ===");
    const props = Object.keys(prisma);
    const models = props.filter(p => !p.startsWith('_') && !p.startsWith('$'));
    console.log(models);
}
checkPrismaModels();
//# sourceMappingURL=check_prisma.js.map