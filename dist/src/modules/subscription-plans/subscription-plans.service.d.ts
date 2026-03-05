import { PrismaService } from '../../prisma/prisma.service';
export declare class SubscriptionPlansService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: {
        name: string;
        price: number;
        description?: string;
        features: string[];
        isPopular?: boolean;
    }): Promise<any>;
    update(id: string, data: Partial<{
        name: string;
        price: number;
        description: string;
        features: string[];
        isPopular: boolean;
    }>): Promise<any>;
    remove(id: string): Promise<any>;
}
