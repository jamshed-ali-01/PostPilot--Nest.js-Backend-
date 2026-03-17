import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service.js';
import { InvitationsResolver } from './invitations.resolver.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
    imports: [PrismaModule],
    providers: [InvitationsService, InvitationsResolver],
    exports: [InvitationsService],
})
export class InvitationsModule { }
