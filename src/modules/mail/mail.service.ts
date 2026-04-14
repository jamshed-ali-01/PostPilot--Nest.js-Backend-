import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private prisma: PrismaService) {}

  private async sendMail(options: { from: string; to: string; subject: string; html: string }) {
    // Priority 1: AWS SES if configured in env (Direct SDK approach)
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
      this.logger.log('Using Direct AWS SES SDK for sending email');
      const sesClient = new SESClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const command = new SendEmailCommand({
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
      } catch (err) {
        if (err.name === 'MessageRejected' || err.message.includes('not verified')) {
          this.logger.error('--- AWS SES IDENTITY VERIFICATION ERROR ---');
          this.logger.error(`The email "${options.from}" or "${options.to}" is not verified in AWS SES (Region: ${process.env.AWS_REGION}).`);
          this.logger.error('If your SES account is in SANDBOX mode, you must verify BOTH the sender and the recipient.');
        }
        this.logger.error('Direct SES Send Error:', err.stack);
        throw err;
      }
    }

    // Priority 2: SMTP from DB (Nodemailer approach)
    const smtpConfig = await this.prisma.systemSettings.findUnique({
      where: { key: 'SMTP_CONFIG' },
    });

    if (!smtpConfig) {
      throw new Error('Email configuration is missing (No AWS SES env or SMTP_CONFIG in DB).');
    }

    const config = smtpConfig.value as any;
    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      secure: config.secure !== undefined ? config.secure : false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return info;
  }

  async sendInvitationEmail(to: string, businessName: string, inviteLink: string) {
    try {
      const info = await this.sendMail({
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
      });
      this.logger.log(`Invitation email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}:`, error.stack);
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    this.logger.log(`\n==========================================\n[DEVELOPMENT] OTP for ${to}: ${otp}\n==========================================\n`);
    try {
      const sender = process.env.SES_SENDER_EMAIL || 'no-reply@postpilot.com';

      const info = await this.sendMail({
        from: `"PostPilot" <${sender}>`,
        to,
        subject: `${otp} is your PostPilot verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Verify your email</h2>
            <p>Hello,</p>
            <p>To continue with your PostPilot registration, please use the following verification code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f7ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #007bff;">${otp}</span>
            </div>
            <p>This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} PostPilot. All rights reserved.</p>
          </div>
        `,
      });

      this.logger.log(`OTP email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}:`, error.stack);
      throw error;
    }
  }

  async sendResetPasswordEmail(to: string, otp: string) {
    this.logger.log(`\n==========================================\n[DEVELOPMENT] Password Reset Code for ${to}: ${otp}\n==========================================\n`);
    try {
      const sender = process.env.SES_SENDER_EMAIL || 'no-reply@postpilot.com';

      const info = await this.sendMail({
        from: `"PostPilot" <${sender}>`,
        to,
        subject: `${otp} is your password reset code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Reset your password</h2>
            <p>Hello,</p>
            <p>We received a request to reset your PostPilot account password. Use the code below to complete the reset:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f7ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #007bff;">${otp}</span>
            </div>
            <p>This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} PostPilot. All rights reserved.</p>
          </div>
        `,
      });

      this.logger.log(`Reset password email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${to}:`, error.stack);
      throw error;
    }
  }
}
