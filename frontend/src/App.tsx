import './App.css'
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ImageDisplay } from './components/ImageDisplay';
import { IPFSUpload } from './components/IPFSUpload';
import { ZamaIntegration } from './components/ZamaIntegration';
import { DecryptImage } from './components/DecryptImage';

function App() {
  const { isConnected } = useAccount();
  const [password, setPassword] = useState<string>('');
  const [encryptedImageData, setEncryptedImageData] = useState<string>('');
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null);

  // 初始化FHEVM实例
  useEffect(() => {
    const initFHEVM = async () => {
      if (!isConnected) return;
      
      try {
        const { initSDK, createInstance, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');
        await initSDK();

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

    initFHEVM();
  }, [isConnected]);

  const handlePasswordGenerated = (newPassword: string) => {
    setPassword(newPassword);
  };

  const handleEncryptedImageGenerated = (encryptedData: string) => {
    setEncryptedImageData(encryptedData);
  };

  const handleUploadComplete = (hash: string) => {
    setIpfsHash(hash);
  };

  const handleContractCall = (imageId: number) => {
    setUploadedImageId(imageId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1>SecureHealth</h1>
            <p>基于区块链的安全图片管理系统</p>
          </div>
          <div className="wallet-section">
            <ConnectButton />
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="upload-section">
          <h2>🔒 上传 & 加密图片</h2>
          
          <div className="step-container">
            <div className="step">
              <h3>步骤 1: 图片显示与加密</h3>
              <ImageDisplay 
                onPasswordGenerated={handlePasswordGenerated}
                onEncryptedImageGenerated={handleEncryptedImageGenerated}
              />
            </div>

            <div className="step">
              <h3>步骤 2: 上传到IPFS</h3>
              <IPFSUpload 
                encryptedImageData={encryptedImageData}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            <div className="step">
              <h3>步骤 3: 上传到区块链</h3>
              <ZamaIntegration 
                password={password}
                ipfsHash={ipfsHash}
                onContractCall={handleContractCall}
              />
            </div>

            {uploadedImageId !== null && (
              <div className="success-message">
                <h3>✅ 上传完成!</h3>
                <p>图片ID: <strong>{uploadedImageId}</strong></p>
                <p>您现在可以在解密部分使用这个ID来解密图片</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="decrypt-section">
          <h2>🔓 解密图片</h2>
          <DecryptImage fhevmInstance={fhevmInstance} />
        </div>

        <div className="info-section">
          <h2>📝 系统说明</h2>
          <div className="info-content">
            <h3>工作原理:</h3>
            <ol>
              <li><strong>图片加密:</strong> 使用生成的EVM地址格式密码对图片进行AES加密</li>
              <li><strong>IPFS存储:</strong> 将加密后的图片上传到IPFS获得hash</li>
              <li><strong>密码保护:</strong> 使用Zama FHE技术将密码加密存储在区块链上</li>
              <li><strong>权限控制:</strong> 只有上传者和被授权的地址可以解密密码</li>
              <li><strong>图片解密:</strong> 从链上解密密码，然后解密IPFS上的图片</li>
            </ol>
            
            <h3>技术栈:</h3>
            <ul>
              <li><strong>前端:</strong> React + TypeScript + Viem + RainbowKit</li>
              <li><strong>加密:</strong> Zama FHE + AES</li>
              <li><strong>存储:</strong> IPFS + 以太坊区块链</li>
              <li><strong>钱包:</strong> MetaMask 等 Web3 钱包</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
