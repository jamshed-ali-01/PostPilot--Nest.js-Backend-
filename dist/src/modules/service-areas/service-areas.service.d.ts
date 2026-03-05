import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceAreaInput } from './dto/create-service-area.input';
export declare class ServiceAreasService {
    private prisma;
    constructor(prisma: PrismaService);
    create(input: CreateServiceAreaInput): Promise<{
        id: string;
        businessId: string;
        location: string | null;
        postcode: string;
    }>;
    findAllByBusiness(businessId: string): Promise<{
        id: string;
        businessId: string;
        location: string | null;
        postcode: string;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        businessId: string;
        location: string | null;
        postcode: string;
    }>;
}
