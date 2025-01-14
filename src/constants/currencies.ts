export const CURRENCIES = {
  USDT: {
    code: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 2
  },
  ARS: {
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: '$',
    decimals: 2
  },
  BRL: {
    code: 'BRL',
    name: 'Real Brasileño',
    symbol: 'R$',
    decimals: 2
  }
} as const;

export const CONVERSION_TYPES = [
  {
    id: '1',
    label: 'USDT a ARS',
    from: 'USDT',
    to: 'ARS',
    description: 'Convertir de USDT a Pesos Argentinos'
  },
  {
    id: '2',
    label: 'ARS a USDT',
    from: 'ARS',
    to: 'USDT',
    description: 'Convertir de Pesos Argentinos a USDT'
  },
  {
    id: '3',
    label: 'USDT a BRL',
    from: 'USDT',
    to: 'BRL',
    description: 'Convertir de USDT a Reales Brasileños'
  },
  {
    id: '4',
    label: 'BRL a USDT',
    from: 'BRL',
    to: 'USDT',
    description: 'Convertir de Reales Brasileños a USDT'
  }
] as const;

export const BANK_DETAILS = {
  name: 'Produbanco',
  accountType: 'Pro Pyme',
  accountNumber: '27059070809',
  owner: 'Ecucondor S.A.S.',
  ruc: '1391937000001',
  email: 'ecucondor@gmail.com'
} as const;
