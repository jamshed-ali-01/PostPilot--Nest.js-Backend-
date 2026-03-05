import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';

@Module({
    providers: [RolesService, RolesResolver],
    exports: [RolesService],
})
export class RolesModule { }
