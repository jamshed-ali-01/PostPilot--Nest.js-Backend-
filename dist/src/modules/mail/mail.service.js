"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const client_ses_1 = require("@aws-sdk/client-ses");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
let MailService = MailService_1 = class MailService {
    prisma;
    logger = new common_1.Logger(MailService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMail(options) {
        const provider = process.env.MAIL_PROVIDER || 'fallback';
        if (provider === 'ses') {
            return this.sendViaSES(options);
        }
        if (provider === 'smtp') {
            return this.sendViaSMTP(options);
        }
        try {
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                return await this.sendViaSES(options);
            }
        }
        catch (err) {
            this.logger.warn(`AWS SES failed, attempting SMTP fallback. Error: ${err.message}`);
        }
        return this.sendViaSMTP(options);
    }
    async sendViaSES(options) {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
            throw new Error('AWS SES credentials not configured in environment.');
        }
        this.logger.log('Sending email via AWS SES SDK');
        const sesClient = new client_ses_1.SESClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        const command = new client_ses_1.SendEmailCommand({
            Source: options.from,
            Destination: {
                ToAddresses: [options.to],
            },
            Message: {
                Subject: { Data: options.subject },
                Body: {
                    Html: { Data: options.html },
                },
            },
        });
        try {
            const result = await sesClient.send(command);
            return { messageId: result.MessageId };
        }
        catch (err) {
            if (err.name === 'MessageRejected' || err.message.includes('not verified')) {
                this.logger.error('--- AWS SES IDENTITY VERIFICATION ERROR ---');
                this.logger.error(`The email "${options.from}" or "${options.to}" is not verified in AWS SES (Region: ${process.env.AWS_REGION}).`);
            }
            throw err;
        }
    }
    async sendViaSMTP(options) {
        let config = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        };
        if (!config.user || !config.pass) {
            const smtpSettings = await this.prisma.systemSettings.findUnique({
                where: { key: 'SMTP_CONFIG' },
            });
            if (smtpSettings) {
                const dbConfig = smtpSettings.value;
                config = {
                    host: dbConfig.host || config.host,
                    port: dbConfig.port || config.port,
                    secure: dbConfig.secure !== undefined ? dbConfig.secure : config.secure,
                    user: dbConfig.user,
                    pass: dbConfig.pass,
                };
            }
        }
        if (!config.user || !config.pass) {
            throw new Error('SMTP credentials not configured (Check .env or SystemSettings in DB).');
        }
        this.logger.log(`Sending email via SMTP (${config.host})`);
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });
        return await transporter.sendMail({
            from: options.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
    async sendInvitationEmail(to, businessName, inviteLink) {
        try {
            const info = await this.sendMail({
                from: `"Recommend Team" <no-reply@recommend.org.uk>`,
                to,
                subject: `You've been invited to join ${businessName} on Recommend`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Invitation to join ${businessName}</h2>
            <p>Hello,</p>
            <p>You have been invited to join <strong>${businessName}</strong> on Recommend, the ultimate social media management platform.</p>
            <p>Click the button below to accept the invitation and set up your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${inviteLink}">${inviteLink}</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">If you weren't expecting this invitation, you can safely ignore this email.</p>
          </div>
        `,
            });
            this.logger.log(`Invitation email sent to ${to}: ${info.messageId}`);
            return info;
        }
        catch (error) {
            this.logger.error(`Failed to send invitation email to ${to}:`, error.stack);
        }
    }
    async sendOtpEmail(to, otp) {
        this.logger.log(`\n==========================================\n[DEVELOPMENT] OTP for ${to}: ${otp}\n==========================================\n`);
        try {
            const sender = process.env.SES_SENDER_EMAIL || 'no-reply@recommend.org.uk';
            const info = await this.sendMail({
                from: `"Recommend" <${sender}>`,
                to,
                subject: `${otp} is your Recommend verification code`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Verify your email</h2>
            <p>Hello,</p>
            <p>To continue with your Recommend registration, please use the following verification code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f7ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #007bff;">${otp}</span>
            </div>
            <p>This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} Recommend. All rights reserved.</p>
          </div>
        `,
            });
            this.logger.log(`OTP email sent to ${to}: ${info.messageId}`);
            return info;
        }
        catch (error) {
            this.logger.error(`Failed to send OTP email to ${to}:`, error.stack);
            throw error;
        }
    }
    async sendResetPasswordEmail(to, otp) {
        this.logger.log(`\n==========================================\n[DEVELOPMENT] Password Reset Code for ${to}: ${otp}\n==========================================\n`);
        try {
            const sender = process.env.SES_SENDER_EMAIL || 'no-reply@recommend.org.uk';
            const info = await this.sendMail({
                from: `"Recommend" <${sender}>`,
                to,
                subject: `${otp} is your password reset code`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Reset your password</h2>
            <p>Hello,</p>
            <p>We received a request to reset your Recommend account password. Use the code below to complete the reset:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f7ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #007bff;">${otp}</span>
            </div>
            <p>This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} Recommend. All rights reserved.</p>
          </div>
        `,
            });
            this.logger.log(`Reset password email sent to ${to}: ${info.messageId}`);
            return info;
        }
        catch (error) {
            this.logger.error(`Failed to send reset password email to ${to}:`, error.stack);
            throw error;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], MailService);
//# sourceMappingURL=mail.service.js.map