import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceAreaInput } from './dto/create-service-area.input';
export declare class ServiceAreasService {
    private prisma;
    constructor(prisma: PrismaService);
    create(input: CreateServiceAreaInput): Promise<{
        id: string;
        businessId: string;
        postcode: string;
        location: string | null;
    }>;
    findAllByBusiness(businessId: string): Promise<{
        id: string;
        businessId: string;
        postcode: string;
        location: string | null;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        businessId: string;
        postcode: string;
        location: string | null;
    }>;
}
