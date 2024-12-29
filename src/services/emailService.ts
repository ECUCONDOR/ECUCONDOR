import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Template del correo de confirmación
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { padding: 20px; }
        .button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Confirma tu correo electrónico</h2>
        <p>Gracias por registrarte. Por favor, confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <a href="{{confirmationURL}}" class="button">Confirmar correo electrónico</a>
        <p>Si no has creado una cuenta, puedes ignorar este mensaje.</p>
    </div>
</body>
</html>
`;

export const sendConfirmationEmail = async (email: string, confirmationToken: string) => {
  try {
    const confirmationURL = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=${confirmationToken}`;
    
    const template = Handlebars.compile(emailTemplate);
    const htmlContent = template({ confirmationURL });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@ecucondor.com',
      to: email,
      subject: 'Confirma tu correo electrónico - EcuCondor',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
};
