export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Template para correo de bienvenida
export const getWelcomeEmailTemplate = (userName: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">¡Bienvenido a EcuCondor!</h1>
      <p>Hola ${userName},</p>
      <p>Gracias por registrarte en EcuCondor. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
      <p>Con tu cuenta podrás:</p>
      <ul>
        <li>Realizar cambios de divisas de manera segura</li>
        <li>Acceder a las mejores tasas del mercado</li>
        <li>Gestionar tus transacciones en línea</li>
      </ul>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>¡Saludos!</p>
      <p>El equipo de EcuCondor</p>
    </div>
  `;
};

// Template para confirmación de transacción
export const getTransactionConfirmationTemplate = (
  transactionId: string,
  amount: number,
  currency: string,
  date: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Confirmación de Transacción</h1>
      <p>Tu transacción ha sido procesada exitosamente.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>ID de Transacción:</strong> ${transactionId}</p>
        <p><strong>Monto:</strong> ${amount} ${currency}</p>
        <p><strong>Fecha:</strong> ${date}</p>
      </div>
      <p>Gracias por confiar en EcuCondor.</p>
      <p>Si no reconoces esta transacción, por favor contáctanos inmediatamente.</p>
    </div>
  `;
};
