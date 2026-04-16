import { ServiceAreasService } from './service-areas.service.js';
import { CreateServiceAreaInput } from './dto/create-service-area.input.js';
export declare class ServiceAreasResolver {
    private readonly serviceAreasService;
    constructor(serviceAreasService: ServiceAreasService);
    createServiceArea(input: CreateServiceAreaInput): Promise<{
        id: string;
        businessId: string;
        postcode: string;
        location: string | null;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        postcode: string;
        location: string | null;
    }[]>;
    removeServiceArea(id: string): Promise<{
        id: string;
        businessId: string;
        postcode: string;
        location: string | null;
    }>;
}
