import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private prisma: PrismaService) {}

  private async getTransporter() {
    const smtpConfig = await this.prisma.systemSettings.findUnique({
      where: { key: 'SMTP_CONFIG' },
    });

    if (!smtpConfig) {
      this.logger.warn('SMTP_CONFIG not found in system settings. Using fallback if available.');
      // Return a dummy transporter or throw error
      throw new Error('SMTP configuration is missing. System Admin must configure SMTP settings.');
    }

    const config = smtpConfig.value as any;

    return nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      secure: config.secure !== undefined ? config.secure : false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendInvitationEmail(to: string, businessName: string, inviteLink: string) {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: `"PostPilot Team" <no-reply@postpilot.com>`,
        to,
        subject: `You've been invited to join ${businessName} on PostPilot`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Invitation to join ${businessName}</h2>
            <p>Hello,</p>
            <p>You have been invited to join <strong>${businessName}</strong> on PostPilot, the ultimate social media management platform.</p>
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
      };

      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}:`, error.stack);
      // We don't throw here to avoid failing the whole invitation process if email fails
      // but we log it clearly.
    }
  }
}
