import { SocialAccountsService } from './social-accounts.service';
export declare class SocialAccountsController {
    private readonly socialAccountsService;
    constructor(socialAccountsService: SocialAccountsService);
    handleCallback(code: string, state: string, error: string, errorDescription: string): Promise<{
        url: string;
    }>;
}
