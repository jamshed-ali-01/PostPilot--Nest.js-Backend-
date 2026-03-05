import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceAreaInput } from './dto/create-service-area.input';

@Injectable()
export class ServiceAreasService {
    constructor(private prisma: PrismaService) { }

    async create(input: CreateServiceAreaInput) {
        return this.prisma.serviceArea.create({
            data: input,
        });
    }

    async findAllByBusiness(businessId: string) {
        return this.prisma.serviceArea.findMany({
            where: { businessId },
        });
    }

    async remove(id: string) {
        return this.prisma.serviceArea.delete({
            where: { id },
        });
    }
}
