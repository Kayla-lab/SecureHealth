import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import CryptoJS from 'crypto-js';

interface DecryptImageProps {
  fhevmInstance?: any;
}

export const DecryptImage: React.FC<DecryptImageProps> = ({ fhevmInstance }) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [imageId, setImageId] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string>('');
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [decryptedImage, setDecryptedImage] = useState<string>('');
  const [decryptResult, setDecryptResult] = useState<string>('');

  // 合约地址 (Sepolia testnet)
  const CONTRACT_ADDRESS = '0x953303a9Bda0A8264a1e936Bc9996b536DE02786';

  // 从合约获取图片信息
  const getImageFromContract = async (id: string) => {
    try {
      // 模拟从合约获取数据
      const mockIpfsHash = `QmTestHash${id}abcdef123456789`;
      const mockEncryptedPasswordHandle = `0x${id.padStart(64, '0')}`;
      
      console.log('模拟获取合约数据:', {
        imageId: id,
        ipfsHash: mockIpfsHash,
        encryptedPasswordHandle: mockEncryptedPasswordHandle
      });

      return {
        ipfsHash: mockIpfsHash,
        encryptedPasswordHandle: mockEncryptedPasswordHandle
      };
    } catch (error) {
      console.error('获取合约数据失败:', error);
      throw error;
    }
  };

  // 使用Zama解密密码
  const decryptPasswordFromContract = async (encryptedPasswordHandle: string) => {
    if (!fhevmInstance || !address || !walletClient) {
      throw new Error('FHEVM实例未就绪或钱包未连接');
    }

    try {
      // 生成密钥对
      const keypair = fhevmInstance.generateKeypair();
      
      // 准备解密请求
      const handleContractPairs = [{
        handle: encryptedPasswordHandle,
        contractAddress: CONTRACT_ADDRESS,
      }];
      
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      // 创建EIP712签名
      fhevmInstance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      // 模拟签名 (实际应用中需要用户签名)
      const mockSignature = "0x" + "a".repeat(130); // 模拟签名
      
      // 执行用户解密 (模拟)
      await fhevmInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        mockSignature.replace("0x", ""),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      // 模拟解密结果
      const mockDecryptedPassword = `0x${'a'.repeat(40)}`;
      console.log('模拟解密密码:', mockDecryptedPassword);
      return mockDecryptedPassword;

    } catch (error) {
      console.error('Zama解密失败:', error);
      throw error;
    }
  };

  // 模拟从IPFS获取加密图片数据
  const getEncryptedImageFromIPFS = async (_hash: string): Promise<string> => {
    // 模拟IPFS获取延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回模拟的加密数据 (实际应该从IPFS获取)
    const mockEncryptedData = CryptoJS.AES.encrypt("mock_image_data_base64", "mock_password").toString();
    console.log('模拟从IPFS获取加密图片数据');
    return mockEncryptedData;
  };

  // 使用密码解密图片
  const decryptImageData = (encryptedImageData: string, password: string): string => {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedImageData, password);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedData) {
        throw new Error('解密失败，密码可能不正确');
      }

      // 模拟返回解密后的图片数据
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    } catch (error) {
      console.error('AES解密失败:', error);
      throw error;
    }
  };

  // 执行完整的解密流程
  const handleDecrypt = async () => {
    if (!imageId || !isConnected) {
      alert('请输入图片ID并确保钱包已连接');
      return;
    }

    setIsDecrypting(true);
    setDecryptResult('');
    setDecryptedPassword('');
    setIpfsHash('');
    setDecryptedImage('');

    try {
      // 步骤1: 从合约获取图片信息
      setDecryptResult('正在从合约获取图片信息...');
      const contractData = await getImageFromContract(imageId);
      setIpfsHash(contractData.ipfsHash);

      // 步骤2: 解密密码
      setDecryptResult('正在从链上解密密码...');
      const password = await decryptPasswordFromContract(contractData.encryptedPasswordHandle);
      setDecryptedPassword(password);

      // 步骤3: 从IPFS获取加密图片
      setDecryptResult('正在从IPFS获取加密图片...');
      const encryptedImageData = await getEncryptedImageFromIPFS(contractData.ipfsHash);

      // 步骤4: 使用解密的密码解密图片
      setDecryptResult('正在解密图片...');
      const decryptedImageData = decryptImageData(encryptedImageData, password);
      setDecryptedImage(decryptedImageData);

      setDecryptResult('✓ 图片解密成功！');

    } catch (error) {
      console.error('解密过程失败:', error);
      setDecryptResult(`解密失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="decrypt-image">
      <h3>解密图片</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="imageId" style={{ display: 'block', marginBottom: '5px' }}>
          图片ID:
        </label>
        <input
          id="imageId"
          type="text"
          value={imageId}
          onChange={(e) => setImageId(e.target.value)}
          placeholder="输入要解密的图片ID"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      <button
        onClick={handleDecrypt}
        disabled={isDecrypting || !imageId || !isConnected}
        style={{
          padding: '12px 24px',
          backgroundColor: isDecrypting ? '#6c757d' : '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isDecrypting || !imageId || !isConnected ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {isDecrypting ? '解密中...' : '开始解密'}
      </button>

      {decryptResult && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: decryptResult.includes('✓') ? '#d4edda' : '#f8f9fa',
          color: decryptResult.includes('✓') ? '#155724' : '#495057',
          border: `1px solid ${decryptResult.includes('✓') ? '#c3e6cb' : '#dee2e6'}`,
          marginBottom: '15px'
        }}>
          {decryptResult}
        </div>
      )}

      {decryptedPassword && (
        <div style={{ marginBottom: '15px' }}>
          <h4>解密的密码:</h4>
          <code style={{
            background: '#e9ecef',
            padding: '8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            display: 'block'
          }}>
            {decryptedPassword}
          </code>
        </div>
      )}

      {ipfsHash && (
        <div style={{ marginBottom: '15px' }}>
          <h4>IPFS Hash:</h4>
          <code style={{
            background: '#e9ecef',
            padding: '8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            display: 'block'
          }}>
            {ipfsHash}
          </code>
        </div>
      )}

      {decryptedImage && (
        <div>
          <h4>解密后的图片:</h4>
          <img 
            src={decryptedImage} 
            alt="解密后的图片" 
            style={{ 
              maxWidth: '300px', 
              height: 'auto',
              border: '2px solid #28a745',
              borderRadius: '4px'
            }} 
          />
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>
        <strong>注意:</strong> 当前为模拟演示版本。实际应用需要：
        <ul style={{ marginLeft: '15px' }}>
          <li>真实的合约交互获取加密密码handle</li>
          <li>用户签名进行Zama解密</li>
          <li>从真实IPFS节点获取加密图片数据</li>
          <li>处理各种错误情况</li>
        </ul>
      </div>
    </div>
  );
};