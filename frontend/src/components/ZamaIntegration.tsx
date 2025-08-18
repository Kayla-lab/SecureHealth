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

  // 合约地址 (Sepolia testnet)
  const CONTRACT_ADDRESS = '0x953303a9Bda0A8264a1e936Bc9996b536DE02786';

  // 初始化FHEVM实例
  useEffect(() => {
    const initFHEVM = async () => {
      try {
        // 初始化SDK
        const { initSDK } = await import('@zama-fhe/relayer-sdk/bundle');
        await initSDK();

        // 创建实例
        const config = {
          ...SepoliaConfig,
          network: window.ethereum
        };
        
        const instance = await createInstance(config);
        setFhevmInstance(instance);
        console.log('FHEVM实例初始化成功');
      } catch (error) {
        console.error('FHEVM初始化失败:', error);
      }
    };

    if (isConnected) {
      initFHEVM();
    }
  }, [isConnected]);


  // 调用合约上传加密密码
  const uploadToContract = async () => {
    if (!fhevmInstance || !address || !password || !ipfsHash || !walletClient) {
      alert('请确保钱包已连接，并且已生成密码和IPFS hash');
      return;
    }

    setIsUploading(true);
    setUploadResult('');

    try {
      // 验证密码格式
      if (!password || !password.startsWith('0x') || password.length !== 42) {
        throw new Error('密码格式不正确，应该是有效的EVM地址格式');
      }

      // 创建加密输入
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // 将EVM地址格式的密码加密
      try {
        // 尝试使用 add160 方法（地址是 160 位）
        const addressAsBigInt = BigInt(password);
        input.add160(addressAsBigInt);
      } catch (add160Error) {
        // 回退到 addAddress 方法
        try {
          input.addAddress(password);
        } catch (addAddressError) {
          // 最后尝试使用32字节方法
          const paddedAddress = '0x' + '0'.repeat(24) + password.slice(2);
          const addressAs32Bytes = BigInt(paddedAddress);
          input.add256(addressAs32Bytes);
        }
      }
      
      // 加密输入
      const encryptedInput = await input.encrypt();

      // 确保参数格式正确
      let encryptedPasswordHandle = encryptedInput.handles[0];
      let inputProof = encryptedInput.inputProof;
      
      // 将 Uint8Array 转换为 hex string（合约期望的格式）
      if (inputProof instanceof Uint8Array) {
        inputProof = '0x' + Array.from(inputProof).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      
      if (encryptedPasswordHandle instanceof Uint8Array) {
        encryptedPasswordHandle = '0x' + Array.from(encryptedPasswordHandle).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // 准备合约调用参数
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
          encryptedPasswordHandle, // 加密的密码 handle
          inputProof,              // 证明
          ipfsHash                 // IPFS hash
        ]
      };

      // 调用合约
      const hash = await walletClient.writeContract(contractCallData);
      setUploadResult(`交易已提交! 交易Hash: ${hash}`);
      
      // 等待交易确认
      if (publicClient) {
        setUploadResult(`交易已提交! 正在等待确认... 交易Hash: ${hash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        // 从receipt logs中解析imageId
        if (receipt.logs && receipt.logs.length > 0) {
          const imageIdHex = receipt.logs[0].topics?.[1];
          if (imageIdHex) {
            const imageId = parseInt(imageIdHex, 16);
            setUploadResult(`图片上传成功! Image ID: ${imageId}, 交易Hash: ${hash}`);
            onContractCall?.(imageId);
          } else {
            setUploadResult(`交易成功确认! 交易Hash: ${hash}`);
          }
        } else {
          setUploadResult(`交易成功确认! 交易Hash: ${hash}`);
        }
      } else {
        setUploadResult(`交易已提交! 交易Hash: ${hash} (无法自动确认)`);
      }
      
    } catch (error) {
      console.error('合约调用失败:', error);
      setUploadResult(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="zama-integration">
      <h3>Zama FHE 合约集成</h3>
      
      {!isConnected && (
        <p style={{ color: '#dc3545' }}>请先连接钱包</p>
      )}
      
      {isConnected && !fhevmInstance && (
        <p style={{ color: '#ffc107' }}>正在初始化FHEVM...</p>
      )}

      {fhevmInstance && (
        <div>
          <p style={{ color: '#28a745', fontSize: '14px' }}>✓ FHEVM实例已就绪</p>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>当前状态:</strong>
            <ul style={{ marginLeft: '20px', fontSize: '14px' }}>
              <li>钱包地址: {address}</li>
              <li>密码: {password ? '✓ 已生成' : '✗ 未生成'}</li>
              <li>IPFS Hash: {ipfsHash ? '✓ 已生成' : '✗ 未生成'}</li>
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
            {isUploading ? '上传中...' : '上传到智能合约'}
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
            <strong>合约信息:</strong>
            <ul style={{ marginLeft: '15px' }}>
              <li>合约地址: {CONTRACT_ADDRESS}</li>
              <li>网络: Sepolia 测试网</li>
              <li>功能: 上传加密密码和IPFS Hash到区块链</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};