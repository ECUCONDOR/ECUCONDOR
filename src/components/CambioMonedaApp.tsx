import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CambioMonedaState {
  tasaActual: string;
  monto: string;
  tipoConversion: string;
  comisionIncluida: boolean;
  resultado: string;
}

const CambioMonedaApp: React.FC = () => {
  const [state, setState] = useState<CambioMonedaState>({
    tasaActual: 'Consultando...',
    monto: '',
    tipoConversion: '1',
    comisionIncluida: false,
    resultado: '',
  });

  const TASA_CAMBIO_DEFAULT = 1315;
  const COMISION_DEFAULT = 0.03;
  const MONTO_PEQUENO_LIMITE = 15;
  const DESCUENTO_MONTO_PEQUENO = 0.5;
  const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines?symbol=USDTARS&interval=1d&limit=1';

  useEffect(() => {
    actualizarTasaCambio();
  }, []);

  const actualizarTasaCambio = async () => {
    try {
      const response = await axios.get(BINANCE_API_URL);
      const data = response.data;

      if (data && data.length > 0) {
        const tasaBinance = Number(data[0][4]);
        const factorDescuento = 0.985;
        const tasaFinal = Number((tasaBinance * factorDescuento).toFixed(2));

        setState((prevState) => ({ ...prevState, tasaActual: `1 USD = ${tasaFinal.toFixed(2)} ARS` }));
      } else {
        throw new Error('No se recibieron datos de la API');
      }
    } catch (error) {
      setState((prevState) => ({ 
        ...prevState, 
        tasaActual: `Error al obtener tasa de Binance: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }));
    }
  };

  const calcular = () => {
    try {
      const monto = Number(state.monto.trim());

      if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser mayor a cero');
      }

      let resultado = '';

      if (state.tipoConversion === '1') {
        const { montoPesos, montoTotalUsd, montoComision } = cambioDolarPeso(
          monto,
          TASA_CAMBIO_DEFAULT,
          state.comisionIncluida
        );
        resultado = generarMensajeDolaresPesos(
          monto,
          montoPesos,
          montoComision,
          montoTotalUsd,
          state.comisionIncluida
        );
      } else {
        const { montoDolares, montoTotalArs } = cambioPesoDolar(monto);
        resultado = generarMensajePesosDolares(monto, montoDolares);
      }

      setState(prevState => ({ ...prevState, resultado }));
    } catch (error) {
      setState(prevState => ({ 
        ...prevState, 
        resultado: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }));
    }
  };

  const cambioDolarPeso = (
    montoDolares: number,
    tasaCambio: number,
    comisionIncluida: boolean
  ): { montoPesos: number; montoTotalUsd: number; montoComision: number } => {
    const monto = montoDolares;
    const tasa = tasaCambio;
    const comisionRate = COMISION_DEFAULT;
    const montoPequeno = MONTO_PEQUENO_LIMITE;
    const descuento = DESCUENTO_MONTO_PEQUENO;

    let montoComision = 0;
    let montoFinalDolares = monto;
    let montoTotalUsd = monto;

    if (monto < montoPequeno) {
      montoComision = descuento;
      montoFinalDolares = monto - descuento;
      montoTotalUsd = monto;
    } else {
      if (comisionIncluida) {
        montoComision = Number((monto * comisionRate).toFixed(2));
        montoFinalDolares = monto - montoComision;
        montoTotalUsd = monto;
      } else {
        montoComision = Number((monto * comisionRate).toFixed(2));
        montoFinalDolares = monto;
        montoTotalUsd = monto + montoComision;
      }
    }

    const montoPesos = Number((montoFinalDolares * tasa).toFixed(2));

    return { montoPesos, montoTotalUsd, montoComision };
  };

  const cambioPesoDolar = (
    montoPesos: number
  ): { montoDolares: number; montoTotalArs: number } => {
    const tasaCambioAjustada = TASA_CAMBIO_DEFAULT + 50;
    const montoDolares = Number((montoPesos / tasaCambioAjustada).toFixed(2));
    const montoTotalArs = montoPesos;
    return { montoDolares, montoTotalArs };
  };

  const generarMensajeDolaresPesos = (
    monto: number,
    montoPesos: number,
    montoComision: number,
    montoTotal: number,
    comisionIncluida: boolean
  ): string => {
    const fechaHora = new Date().toLocaleString();

    let mensaje = `🏦 CAMBIO DE DÓLARES A PESOS 🏦

Fecha y Hora: ${fechaHora}

💰 Resumen de la Conversión 💰

* Monto original: USD ${monto.toFixed(2)}
* Tasa de cambio: ${TASA_CAMBIO_DEFAULT.toFixed(2)}
* Monto en pesos: ARS ${montoPesos.toFixed(2)}
`;

    if (monto < MONTO_PEQUENO_LIMITE) {
      mensaje += `\n(Se deducen ${DESCUENTO_MONTO_PEQUENO} dólares en montos menores a ${MONTO_PEQUENO_LIMITE})`;
    } else {
      if (comisionIncluida) {
        mensaje += `\n✅ Comisión incluida: USD ${montoComision.toFixed(2)}`;
      } else {
        mensaje += `\n(Comisión de ${montoComision.toFixed(2)} dólares no incluida, monto total a enviar: ${montoTotal.toFixed(2)} dólares)`;
      }
    }

    mensaje += `

🏦 Datos Bancarios de Transferencia 🏦

🏦 Banco: Produbanco
🌐 Tipo de Cuenta: Pro Pyme  
📜 Número de Cuenta: 27059070809
👤 Nombre: Ecucondor S.A.S. Sociedad De Beneficio E Interés Colectivo
📄 RUC: 1391937000001
📧 Correo: ecucondor@gmail.com

⚠ Envíe su comprobante de pago y alias a este chat.
⏳ Tiempo estimado: 5-10 minutos.

🌟 Gracias por elegir ECUCONDOR 🌟
🌐 https://ecucondor.com/`;

    return mensaje;
  };

  const generarMensajePesosDolares = (montoPesos: number, montoDolares: number): string => {
    const fechaHora = new Date().toLocaleString();

    return `🏦 CAMBIO DE PESOS A DÓLARES 🏦

Fecha y Hora: ${fechaHora}

💰 Resumen de la Conversión 💰

* Monto en pesos: ARS ${montoPesos.toFixed(2)}
* Monto en dólares: USD ${montoDolares.toFixed(2)}

🏦 Datos Bancarios 🏦

Reina Mosquera
CVU: 0000003100085925582280
Alias: reinasmb.
CUIT/CUIL: 20963144769

✅ Envíe su comprobante de pago y alias. 
⏳ Le notificaremos cuando se complete.

🌟 ¡Gracias por su preferencia! 🌟
🌐 https://ecucondor.com/`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sistema de Cambio de Divisas</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Tasa de Cambio Actual</h2>
        <p className="text-lg text-blue-600">{state.tasaActual}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Opciones de Conversión</h2>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="1"
              checked={state.tipoConversion === '1'}
              onChange={(e) => setState((prevState) => ({ ...prevState, tipoConversion: e.target.value }))}
              className="form-radio"
            />
            <span>Dólares a Pesos</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="2"
              checked={state.tipoConversion === '2'}
              onChange={(e) => setState((prevState) => ({ ...prevState, tipoConversion: e.target.value }))}
              className="form-radio"
            />
            <span>Pesos a Dólares</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monto:
              <input
                type="number"
                value={state.monto}
                onChange={(e) => setState((prevState) => ({ ...prevState, monto: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ingrese el monto"
              />
            </label>
          </div>

          {state.tipoConversion === '1' && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={state.comisionIncluida}
                onChange={(e) => setState((prevState) => ({ ...prevState, comisionIncluida: e.target.checked }))}
                className="form-checkbox"
              />
              <span>Comisión incluida</span>
            </label>
          )}
        </div>
      </div>

      <Button onClick={calcular} className="w-full mb-6">
        Calcular
      </Button>

      {state.resultado && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Ver Resultado</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Resultado de la Conversión</DialogTitle>
              <DialogDescription>
                <pre className="whitespace-pre-wrap font-mono text-sm mt-4">
                  {state.resultado}
                </pre>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button 
                onClick={() => navigator.clipboard.writeText(state.resultado)}
                variant="outline"
              >
                Copiar Resultado
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CambioMonedaApp;
