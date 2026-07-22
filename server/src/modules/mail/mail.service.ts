import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
}

export const MailConfig = {
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true', // true for port 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter = {} as Transporter;

  constructor() {}

  onModuleInit() {
    // Initialize the transporter when the module starts up
    this.transporter = createTransport(MailConfig);
  }

  async sendMail({ to, subject, htmlContent, textContent }: SendMailOptions) {
    try {
      await this.transporter.sendMail({
        from: `"The GARDEN Terminal" <${MailConfig.auth.user}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }
}
