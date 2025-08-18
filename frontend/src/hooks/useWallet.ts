import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  return {
    // Wallet state
    address,
    isConnected,
    isConnecting,
    
    // Connection methods
    connect,
    disconnect,
    openConnectModal,
    
    // Available connectors
    connectors,
  };
}