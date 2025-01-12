import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener tasa de Binance
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTARS');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const tasaBinance = parseFloat(data.price);
    
    // Aplicar factor de descuento
    const factorDescuento = 0.98;
    const tasaFinal = parseFloat((tasaBinance * factorDescuento).toFixed(2));

    return NextResponse.json({ 
      tasa: tasaFinal,
      timestamp: new Date().toISOString(),
      source: 'binance'
    });

  } catch (error) {
    console.error('Error al obtener tasa:', error);
    
    // Devolver tasa por defecto en caso de error
    return NextResponse.json({ 
      tasa: 1365,
      timestamp: new Date().toISOString(),
      source: 'default'
    });
  }
}
