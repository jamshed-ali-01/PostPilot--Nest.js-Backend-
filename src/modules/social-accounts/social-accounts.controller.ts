import { Controller, Get, Query, Res } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import type { Response } from 'express';

@Controller('social-accounts')
export class SocialAccountsController {
    constructor(private readonly socialAccountsService: SocialAccountsService) { }

    @Get('callback')
    async handleCallback(
        @Query('code') code: string,
        @Query('state') state: string, // state will contain businessId and platform
        @Res() res: Response,
    ) {
        try {
            if (!code || !state) {
                throw new Error('Invalid callback parameters');
            }

            // 1. Parse state (e.g., "businessId:platform")
            const [businessId, platform] = state.split(':');

            // 2. Exchange code for token and save account
            await this.socialAccountsService.handleOAuthCallback(businessId, platform, code);

            // 3. Redirect back to frontend settings page with success
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?social=success`);
        } catch (error) {
            console.error('OAuth Callback Error:', error);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?social=error&message=${encodeURIComponent(error.message)}`);
        }
    }
}
