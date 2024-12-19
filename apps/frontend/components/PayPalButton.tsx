import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface PayPalButtonProps {
  amount: string;
}

const PayPalButtonComponent: React.FC<PayPalButtonProps> = ({ amount }) => {
  const { data: session } = useSession();
  const [orderID, setOrderID] = useState<string | null>(null);

  const createOrder = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`, {
        total: amount,
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setOrderID(res.data.id);
      return res.data.id;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear orden de pago');
      return '';
    }
  };

  const onApprove = async (data: any) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/capture-order`, {
        orderId: data.orderID,
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      toast.success('Pago exitoso');
      // Aquí puedes actualizar el estado de la wallet, emitir notificaciones, etc.
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al capturar orden de pago');
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={createOrder}
        onApprove={onApprove}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButtonComponent;
