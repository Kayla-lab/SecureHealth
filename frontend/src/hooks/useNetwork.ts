import { useChainId, useSwitchChain } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';

export function useNetwork() {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const switchToSepolia = () => switchChain({ chainId: sepolia.id });
  const switchToMainnet = () => switchChain({ chainId: mainnet.id });

  const isOnSepolia = chainId === sepolia.id;
  const isOnMainnet = chainId === mainnet.id;

  return {
    // Current network info
    chainId,
    isOnSepolia,
    isOnMainnet,
    
    // Network switching
    switchChain,
    switchToSepolia,
    switchToMainnet,
    isSwitching,
  };
}