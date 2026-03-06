"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAccountsController = void 0;
const common_1 = require("@nestjs/common");
const social_accounts_service_1 = require("./social-accounts.service");
let SocialAccountsController = class SocialAccountsController {
    socialAccountsService;
    constructor(socialAccountsService) {
        this.socialAccountsService = socialAccountsService;
    }
    async handleCallback(code, state, error, errorDescription) {
        console.log(`[SocialAccountsController] Received callback: code=${!!code}, state=${state}`);
        try {
            if (error || errorDescription) {
                throw new Error(errorDescription || error || 'OAuth failed');
            }
            if (!code || !state) {
                throw new Error('Invalid callback parameters (code or state missing)');
            }
            const [bId, platform] = state.split(':');
            const businessId = bId === 'ADMIN' ? undefined : bId;
            await this.socialAccountsService.handleOAuthCallback(businessId, platform, code);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return { url: `${frontendUrl}/settings?social=success` };
        }
        catch (error) {
            console.error('[SocialAccountsController] OAuth Callback Error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return { url: `${frontendUrl}/settings?social=error&message=${encodeURIComponent(error.message)}` };
        }
    }
};
exports.SocialAccountsController = SocialAccountsController;
__decorate([
    (0, common_1.Get)('callback'),
    (0, common_1.Redirect)('http://localhost:5173/settings?social=success', 302),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Query)('error')),
    __param(3, (0, common_1.Query)('error_description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialAccountsController.prototype, "handleCallback", null);
exports.SocialAccountsController = SocialAccountsController = __decorate([
    (0, common_1.Controller)('social-accounts'),
    __metadata("design:paramtypes", [social_accounts_service_1.SocialAccountsService])
], SocialAccountsController);
//# sourceMappingURL=social-accounts.controller.js.map