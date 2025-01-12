'use client';

import { createContext, useContext, useState } from 'react';
import { useAuth } from './auth-context';

type PanelControlContextType = {
  menuLateralAbierto: boolean;
  alternarMenuLateral: () => void;
  cargando: boolean;
  clienteId: string | null;
  setClienteId: (id: string | null) => void;
};

const defaultContext = {
  menuLateralAbierto: false,
  alternarMenuLateral: () => {},
  cargando: false,
  clienteId: null as string | null,
  setClienteId: (id: string | null) => {}
};

const PanelControlContext = createContext<PanelControlContextType>(defaultContext);

type Props = {
  children: JSX.Element | JSX.Element[];
};

export function PanelControlProvider({ children }: Props) {
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);
  const { loading: cargando } = useAuth();
  const [clienteId, setClienteId] = useState<string | null>(null);

  const alternarMenuLateral = () => {
    setMenuLateralAbierto(!menuLateralAbierto);
  };

  const valor = {
    menuLateralAbierto,
    alternarMenuLateral,
    cargando,
    clienteId,
    setClienteId
  };

  return (
    <PanelControlContext.Provider value={valor}>
      {children}
    </PanelControlContext.Provider>
  );
}

export function usePanelControl() {
  const contexto = useContext(PanelControlContext);
  if (!contexto) {
    throw new Error('usePanelControl debe ser usado dentro de un PanelControlProvider');
  }
  return contexto;
}