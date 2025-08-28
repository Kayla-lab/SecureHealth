import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

interface ZamaIntegrationProps {
  password?: string;
  ipfsHash?: string;
  onContractCall?: (imageId: number) => void;
}

export const ZamaIntegration: React.FC<ZamaIntegrationProps> = ({
  password,
  ipfsHash,
  onContractCall
}) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');

  // Contract address (Sepolia testnet)
  const CONTRACT_ADDRESS = '0x953303a9Bda0A8264a1e936Bc9996b536DE02786';

  // Initialize FHEVM instance
  useEffect(() => {
    const initFHEVM = async () => {
      try {
        // Initialize SDK
        const { initSDK } = await import('@zama-fhe/relayer-sdk/bundle');
        await initSDK();

        // Create instance
        const config = {
          ...SepoliaConfig,
          network: window.ethereum
        };
        
        const instance = await createInstance(config);
        setFhevmInstance(instance);
        console.log('FHEVM instance initialized successfully');
      } catch (error) {
        console.error('FHEVM initialization failed:', error);
      }
    };

    if (isConnected) {
      initFHEVM();
    }
  }, [isConnected]);


  // Call contract to upload encrypted password
  const uploadToContract = async () => {
    if (!fhevmInstance || !address || !password || !ipfsHash || !walletClient) {
      alert('Please ensure wallet is connected and password and IPFS hash are generated');
      return;
    }

    setIsUploading(true);
    setUploadResult('');

    try {
      // Validate password format
      if (!password || !password.startsWith('0x') || password.length !== 42) {
        throw new Error('Incorrect password format, should be valid EVM address format');
      }

      // Create encrypted input
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // Encrypt EVM address format password
      try {
        // Try using add160 method (address is 160 bits)
        const addressAsBigInt = BigInt(password);
        input.add160(addressAsBigInt);
      } catch (add160Error) {
        // Fall back to addAddress method
        try {
          input.addAddress(password);
        } catch (addAddressError) {
          // Finally try using 32-byte method
          const paddedAddress = '0x' + '0'.repeat(24) + password.slice(2);
          const addressAs32Bytes = BigInt(paddedAddress);
          input.add256(addressAs32Bytes);
        }
      }
      
      // Encrypt input
      const encryptedInput = await input.encrypt();

      // Ensure parameter format is correct
      let encryptedPasswordHandle = encryptedInput.handles[0];
      let inputProof = encryptedInput.inputProof;
      
      // Convert Uint8Array to hex string (format expected by contract)
      if (inputProof instanceof Uint8Array) {
        inputProof = '0x' + Array.from(inputProof).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      
      if (encryptedPasswordHandle instanceof Uint8Array) {
        encryptedPasswordHandle = '0x' + Array.from(encryptedPasswordHandle).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // Prepare contract call parameters
      const contractCallData = {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [
              {
                "internalType": "externalEaddress",
                "name": "encryptedPassword",
                "type": "bytes32"
              },
              {
                "internalType": "bytes",
                "name": "inputProof",
                "type": "bytes"
              },
              {
                "internalType": "string",
                "name": "imageHash",
                "type": "string"
              }
            ],
            "name": "uploadImage",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'uploadImage' as const,
        args: [
          encryptedPasswordHandle, // Encrypted password handle
          inputProof,              // Proof
          ipfsHash                 // IPFS hash
        ]
      };

      // Call contract
      const hash = await walletClient.writeContract(contractCallData);
      setUploadResult(`Transaction submitted! Transaction Hash: ${hash}`);
      
      // Wait for transaction confirmation
      if (publicClient) {
        setUploadResult(`Transaction submitted! Waiting for confirmation... Transaction Hash: ${hash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        // Parse imageId from receipt logs
        if (receipt.logs && receipt.logs.length > 0) {
          const imageIdHex = receipt.logs[0].topics?.[1];
          if (imageIdHex) {
            const imageId = parseInt(imageIdHex, 16);
            setUploadResult(`Image upload successful! Image ID: ${imageId}, Transaction Hash: ${hash}`);
            onContractCall?.(imageId);
          } else {
            setUploadResult(`Transaction confirmed successfully! Transaction Hash: ${hash}`);
          }
        } else {
          setUploadResult(`Transaction confirmed successfully! Transaction Hash: ${hash}`);
        }
      } else {
        setUploadResult(`Transaction submitted! Transaction Hash: ${hash} (unable to auto-confirm)`);
      }
      
    } catch (error) {
      console.error('Contract call failed:', error);
      setUploadResult(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="zama-integration">
      <h3>Zama FHE Contract Integration</h3>
      
      {!isConnected && (
        <p style={{ color: '#dc3545' }}>Please connect wallet first</p>
      )}
      
      {isConnected && !fhevmInstance && (
        <p style={{ color: '#ffc107' }}>Initializing FHEVM...</p>
      )}

      {fhevmInstance && (
        <div>
          <p style={{ color: '#28a745', fontSize: '14px' }}>✓ FHEVM instance ready</p>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Current Status:</strong>
            <ul style={{ marginLeft: '20px', fontSize: '14px' }}>
              <li>Wallet Address: {address}</li>
              <li>Password: {password ? '✓ Generated' : '✗ Not generated'}</li>
              <li>IPFS Hash: {ipfsHash ? '✓ Generated' : '✗ Not generated'}</li>
            </ul>
          </div>

          <button
            onClick={uploadToContract}
            disabled={isUploading || !password || !ipfsHash}
            style={{
              padding: '12px 24px',
              backgroundColor: isUploading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isUploading || !password || !ipfsHash ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload to Smart Contract'}
          </button>

          {uploadResult && (
            <div style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: uploadResult.includes('成功') ? '#d4edda' : '#f8d7da',
              color: uploadResult.includes('成功') ? '#155724' : '#721c24',
              border: `1px solid ${uploadResult.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {uploadResult}
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            <strong>Contract Information:</strong>
            <ul style={{ marginLeft: '15px' }}>
              <li>Contract Address: {CONTRACT_ADDRESS}</li>
              <li>Network: Sepolia Testnet</li>
              <li>Function: Upload encrypted password and IPFS Hash to blockchain</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};