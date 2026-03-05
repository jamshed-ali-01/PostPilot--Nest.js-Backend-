import { Module } from '@nestjs/common';
import { ServiceAreasService } from './service-areas.service';
import { ServiceAreasResolver } from './service-areas.resolver';

@Module({
    providers: [ServiceAreasService, ServiceAreasResolver],
    exports: [ServiceAreasService],
})
export class ServiceAreasModule { }
