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

  // 简单测试合约调用（不加密）
  const testSimpleContractCall = async () => {
    if (!walletClient || !publicClient) {
      alert('钱包未连接');
      return;
    }

    try {
      console.log('测试简单的合约调用...');
      setUploadResult('正在测试合约调用...');

      // 测试调用一个简单的view函数
      const totalImages = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [],
            "name": "getTotalImages",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: 'getTotalImages',
      });

      console.log('合约调用成功，总图片数:', totalImages);
      setUploadResult(`合约连接正常，当前总图片数: ${totalImages}`);
    } catch (error) {
      console.error('简单合约调用失败:', error);
      setUploadResult(`合约调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

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

      console.log('开始加密密码:', password);

      // 创建加密输入
      console.log('创建加密输入，合约地址:', CONTRACT_ADDRESS, '用户地址:', address);
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // 将EVM地址格式的密码转换为address并加密
      console.log('正在添加地址到加密输入:', password);
      
      // 尝试使用 add160 方法（地址是 160 位）
      try {
        // 将地址转换为 BigInt
        const addressAsBigInt = BigInt(password);
        console.log('地址转换为BigInt:', addressAsBigInt);
        
        input.add160(addressAsBigInt);
        console.log('使用add160方法成功');
      } catch (add160Error) {
        console.error('add160方法失败:', add160Error);
        
        // 回退到 addAddress 方法
        try {
          input.addAddress(password);
          console.log('回退到addAddress方法成功');
        } catch (addAddressError) {
          console.error('addAddress方法也失败:', addAddressError);
          
          // 最后尝试使用32字节方法
          try {
            // 将地址填充为32字节
            const paddedAddress = '0x' + '0'.repeat(24) + password.slice(2);
            const addressAs32Bytes = BigInt(paddedAddress);
            input.add256(addressAs32Bytes);
            console.log('使用add256方法成功');
          } catch (add256Error) {
            console.error('所有加密方法都失败:', add256Error);
            throw new Error('无法添加地址到加密输入');
          }
        }
      }
      
      console.log('开始加密输入...');
      // 加密输入
      const encryptedInput = await input.encrypt();
      console.log('加密输入完成');
      
      console.log('加密输入创建成功:', {
        handles: encryptedInput.handles,
        inputProof: encryptedInput.inputProof,
        handleType: typeof encryptedInput.handles[0],
        proofType: typeof encryptedInput.inputProof
      });

      // 确保参数格式正确
      let encryptedPasswordHandle = encryptedInput.handles[0];
      let inputProof = encryptedInput.inputProof;
      
      // 如果 inputProof 是 Uint8Array，转换为 hex string
      if (inputProof instanceof Uint8Array) {
        inputProof = '0x' + Array.from(inputProof).map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('inputProof 转换为 hex string:', inputProof);
      }
      
      // 如果 encryptedPasswordHandle 是 Uint8Array，转换为 hex string
      if (encryptedPasswordHandle instanceof Uint8Array) {
        encryptedPasswordHandle = '0x' + Array.from(encryptedPasswordHandle).map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('encryptedPasswordHandle 转换为 hex string:', encryptedPasswordHandle);
      }
      
      // 确保 handle 是正确的格式
      if (typeof encryptedPasswordHandle !== 'string' || !encryptedPasswordHandle.startsWith('0x')) {
        console.warn('encryptedPasswordHandle 格式仍然不正确:', encryptedPasswordHandle);
      } else {
        console.log('encryptedPasswordHandle 格式正确:', encryptedPasswordHandle.slice(0, 10) + '...');
      }
      
      console.log('合约参数详情:', {
        encryptedPasswordHandle,
        inputProof,
        ipfsHash,
        passwordHandleType: typeof encryptedPasswordHandle,
        proofType: typeof inputProof,
        hashType: typeof ipfsHash,
        handleIsString: typeof encryptedPasswordHandle === 'string',
        handleLength: encryptedPasswordHandle?.length,
        proofIsUint8Array: inputProof instanceof Uint8Array,
        proofLength: inputProof?.length
      });

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

      console.log('准备调用合约:', contractCallData);

      // 调用合约
      try {
        const hash = await walletClient.writeContract(contractCallData);
        console.log('交易Hash:', hash);
        
        setUploadResult(`交易已提交! 交易Hash: ${hash}`);
        
        // 等待交易确认
        if (publicClient) {
          setUploadResult(`交易已提交! 正在等待确认... 交易Hash: ${hash}`);
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          console.log('交易确认:', receipt);
          
          // 从receipt logs中解析imageId
          if (receipt.logs && receipt.logs.length > 0) {
            // ImageUploaded事件的第一个log通常包含imageId
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
      } catch (contractError) {
        console.error('合约调用错误:', contractError);
        throw contractError; // 重新抛出以被外层 catch 捕获
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
            onClick={testSimpleContractCall}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              marginBottom: '15px'
            }}
          >
            测试合约连接
          </button>

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