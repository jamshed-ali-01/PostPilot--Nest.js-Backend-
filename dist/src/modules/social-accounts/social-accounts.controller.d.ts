import { SocialAccountsService } from './social-accounts.service';
import type { Response } from 'express';
export declare class SocialAccountsController {
    private readonly socialAccountsService;
    constructor(socialAccountsService: SocialAccountsService);
    handleCallback(code: string, state: string, res: Response): Promise<void>;
}
