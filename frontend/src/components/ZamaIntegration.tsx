import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
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
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');

  // 合约地址 (需要根据实际部署地址修改)
  const CONTRACT_ADDRESS = '0x8Fdb26641d14a80FCCBE87BF455338Dd9C539a50'; // 示例地址

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
      // 创建加密输入
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // 将EVM地址格式的密码转换为address并加密
      input.addAddress(password);
      
      // 加密输入
      const encryptedInput = await input.encrypt();
      
      console.log('加密输入创建成功:', {
        handles: encryptedInput.handles,
        inputProof: encryptedInput.inputProof
      });

      // 准备合约调用参数
      const contractCallData = {
        address: CONTRACT_ADDRESS,
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
        functionName: 'uploadImage',
        args: [
          encryptedInput.handles[0], // 加密的密码
          encryptedInput.inputProof,  // 证明
          ipfsHash                    // IPFS hash
        ]
      };

      console.log('准备调用合约:', contractCallData);

      // 调用合约 (这里需要使用viem进行实际的合约调用)
      // const hash = await walletClient.writeContract(contractCallData);
      
      // 模拟合约调用成功
      const mockImageId = Math.floor(Math.random() * 1000);
      setUploadResult(`图片上传成功! Image ID: ${mockImageId}`);
      onContractCall?.(mockImageId);
      
      console.log('模拟合约调用成功, Image ID:', mockImageId);
      
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
            <strong>注意:</strong> 这里使用模拟的合约调用。实际部署时需要：
            <ul style={{ marginLeft: '15px' }}>
              <li>更新CONTRACT_ADDRESS为实际部署的合约地址</li>
              <li>使用viem进行真实的合约调用</li>
              <li>处理交易确认和错误</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};