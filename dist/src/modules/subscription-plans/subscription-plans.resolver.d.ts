import { SubscriptionPlansService } from './subscription-plans.service';
export declare class SubscriptionPlansResolver {
    private readonly plansService;
    constructor(plansService: SubscriptionPlansService);
    findAll(): Promise<any>;
    createSubscriptionPlan(name: string, price: number, features: string[], description: string, isPopular: boolean, user: any): Promise<any>;
    updateSubscriptionPlan(id: string, name: string, price: number, features: string[], description: string, isPopular: boolean, user: any): Promise<any>;
    deleteSubscriptionPlan(id: string, user: any): Promise<boolean>;
}
