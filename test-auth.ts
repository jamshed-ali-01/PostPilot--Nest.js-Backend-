import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/modules/auth/auth.service';

async function testAuth() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    console.log('--- Testing SystemAdmin Login ---');
    const result = await authService.validateUser('jamshedlinkedin@gmail.com', 'Admin@123');
    console.log(JSON.stringify(result, null, 2));

    await app.close();
}

testAuth().catch(console.error);
