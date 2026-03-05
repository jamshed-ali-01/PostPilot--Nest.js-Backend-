import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service.js';
import { SuperAdminResolver } from './super-admin.resolver.js';

@Module({
    providers: [SuperAdminService, SuperAdminResolver],
})
export class SuperAdminModule { }
