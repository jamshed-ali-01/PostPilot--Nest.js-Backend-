import { Module } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { BusinessesResolver } from './businesses.resolver';

@Module({
    providers: [BusinessesService, BusinessesResolver],
    exports: [BusinessesService],
})
export class BusinessesModule { }
