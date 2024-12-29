import Handlebars from 'handlebars';

export interface EmailTemplateData {
  username?: string;
  verificationLink?: string;
  resetPasswordLink?: string;
  orderDetails?: {
    orderId: string;
    amount: number;
    currency: string;
    status: string;
  };
  [key: string]: any;
}

const templates = {
  welcome: `
    <h1>Welcome to EcuCondor, {{username}}!</h1>
    <p>Thank you for joining our platform. We're excited to have you on board!</p>
    {{#if verificationLink}}
    <p>Please verify your email by clicking the link below:</p>
    <a href="{{verificationLink}}">Verify Email</a>
    {{/if}}
  `,
  resetPassword: `
    <h1>Reset Your Password</h1>
    <p>Hello {{username}},</p>
    <p>You have requested to reset your password. Click the link below to proceed:</p>
    <a href="{{resetPasswordLink}}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `,
  orderConfirmation: `
    <h1>Order Confirmation</h1>
    <p>Hello {{username}},</p>
    <p>Your order has been {{orderDetails.status}}.</p>
    <h2>Order Details:</h2>
    <ul>
      <li>Order ID: {{orderDetails.orderId}}</li>
      <li>Amount: {{orderDetails.amount}} {{orderDetails.currency}}</li>
      <li>Status: {{orderDetails.status}}</li>
    </ul>
  `,
};

export function compileTemplate(templateName: keyof typeof templates, data: EmailTemplateData): string {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(data);
}

// Register custom Handlebars helpers if needed
Handlebars.registerHelper('formatCurrency', function(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
});
