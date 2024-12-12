import { ethers } from 'ethers';

// Configura tu proveedor según la blockchain que desees (Ethereum, Binance Smart Chain, etc.)
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export const createWallet = (): { address: string; privateKey: string } => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const getBalance = async (address: string): Promise<string> => {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

// Agrega más funciones según tus necesidades
