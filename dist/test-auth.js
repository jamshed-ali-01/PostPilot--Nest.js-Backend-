"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const auth_service_1 = require("./src/modules/auth/auth.service");
async function testAuth() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    console.log('--- Testing SystemAdmin Login ---');
    const result = await authService.validateUser('jamshedlinkedin@gmail.com', 'Admin@123');
    console.log(JSON.stringify(result, null, 2));
    await app.close();
}
testAuth().catch(console.error);
//# sourceMappingURL=test-auth.js.map