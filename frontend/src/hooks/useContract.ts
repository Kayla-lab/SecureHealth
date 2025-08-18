import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { useAccount } from 'wagmi';

export function useContract(contractAddress: `0x${string}`, abi: any) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  // Read-only contract instance
  const publicContract = publicClient && contractAddress ? getContract({
    address: contractAddress,
    abi,
    client: publicClient,
  }) : null;

  // Write contract instance (requires wallet connection)
  const walletContract = walletClient && contractAddress ? getContract({
    address: contractAddress,
    abi,
    client: walletClient,
  }) : null;

  return {
    // Contract instances
    publicContract,
    walletContract,
    
    // Client instances
    publicClient,
    walletClient,
    
    // User info
    address,
    isConnected: !!address,
  };
}