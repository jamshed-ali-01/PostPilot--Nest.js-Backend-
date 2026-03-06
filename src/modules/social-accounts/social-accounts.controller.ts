import { Controller, Get, Query, Res, Redirect } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import type { Response } from 'express';

@Controller('social-accounts')
export class SocialAccountsController {
    constructor(private readonly socialAccountsService: SocialAccountsService) { }

    @Get('callback')
    @Redirect('http://localhost:5173/settings?social=success', 302)
    async handleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Query('error') error: string,
        @Query('error_description') errorDescription: string,
    ) {
        console.log(`[SocialAccountsController] Received callback: code=${!!code}, state=${state}`);
        try {
            if (error || errorDescription) {
                throw new Error(errorDescription || error || 'OAuth failed');
            }

            if (!code || !state) {
                throw new Error('Invalid callback parameters (code or state missing)');
            }

            // 1. Parse state (e.g., "businessId:platform")
            const [bId, platform] = state.split(':');
            const businessId = bId === 'ADMIN' ? undefined : bId;

            // 2. Exchange code for token and save account
            await this.socialAccountsService.handleOAuthCallback(businessId, platform, code);

            // 3. Status is handled by @Redirect, but we can override URL if needed
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return { url: `${frontendUrl}/settings?social=success` };
        } catch (error) {
            console.error('[SocialAccountsController] OAuth Callback Error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return { url: `${frontendUrl}/settings?social=error&message=${encodeURIComponent(error.message)}` };
        }
    }
}
