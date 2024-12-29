import nodemailer from 'nodemailer';
import { compileTemplate, EmailTemplateData } from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  templateName: 'welcome' | 'resetPassword' | 'orderConfirmation';
  templateData: EmailTemplateData;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, templateName, templateData }: EmailOptions) {
  try {
    const html = compileTemplate(templateName, templateData);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"EcuCondor" <no-reply@ecucondor.com>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Example usage:
/*
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to EcuCondor',
  templateName: 'welcome',
  templateData: {
    username: 'John Doe',
    verificationLink: 'https://ecucondor.com/verify/token123'
  }
});
*/
