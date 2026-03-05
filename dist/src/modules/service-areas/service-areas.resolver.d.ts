import { ServiceAreasService } from './service-areas.service.js';
import { CreateServiceAreaInput } from './dto/create-service-area.input.js';
export declare class ServiceAreasResolver {
    private readonly serviceAreasService;
    constructor(serviceAreasService: ServiceAreasService);
    createServiceArea(input: CreateServiceAreaInput): Promise<{
        id: string;
        businessId: string;
        location: string | null;
        postcode: string;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        location: string | null;
        postcode: string;
    }[]>;
    removeServiceArea(id: string): Promise<{
        id: string;
        businessId: string;
        location: string | null;
        postcode: string;
    }>;
}
