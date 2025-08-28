import './App.css'
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ImageDisplay } from './components/ImageDisplay';
import { IPFSUpload } from './components/IPFSUpload';
import { ZamaIntegration } from './components/ZamaIntegration';
import { DecryptImage } from './components/DecryptImage';
import { UserImageList } from './components/UserImageList';

function App() {
  const { isConnected } = useAccount();
  const [password, setPassword] = useState<string>('');
  const [encryptedImageData, setEncryptedImageData] = useState<string>('');
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

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

  const handleSelectImage = (imageId: number) => {
    setSelectedImageId(imageId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1>SecureHealth</h1>
            <p>🔐 基于区块链的医疗影像安全管理系统</p>
            <div className="medical-breadcrumb">
              <span className="medical-breadcrumb-item active">医疗影像管理</span>
              <span className="medical-breadcrumb-separator">•</span>
              <span className="medical-breadcrumb-item">安全加密存储</span>
              <span className="medical-breadcrumb-separator">•</span>
              <span className="medical-breadcrumb-item">隐私保护</span>
            </div>
          </div>
          <div className="wallet-section">
            <div className="status-indicator status-info" style={{marginBottom: '1rem'}}>
              <span>🔗</span>
              <span>区块链连接状态</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="upload-section">
          <h2>医疗影像上传与加密</h2>
          
          <div className="medical-alert status-info">
            <div className="medical-alert-icon">ℹ️</div>
            <div className="medical-alert-content">
              <h4>安全提醒</h4>
              <p>本系统采用军事级AES加密和区块链存储技术，确保您的医疗影像数据安全可靠。</p>
            </div>
          </div>
          
          <div className="step-container">
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🏥</div>
                <h3 className="medical-card-title">步骤 1: 影像预处理与加密</h3>
              </div>
              <ImageDisplay 
                onPasswordGenerated={handlePasswordGenerated}
                onEncryptedImageGenerated={handleEncryptedImageGenerated}
              />
            </div>

            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">☁️</div>
                <h3 className="medical-card-title">步骤 2: 分布式存储上传</h3>
              </div>
              <IPFSUpload 
                encryptedImageData={encryptedImageData}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🔗</div>
                <h3 className="medical-card-title">步骤 3: 区块链安全存储</h3>
              </div>
              <ZamaIntegration 
                password={password}
                ipfsHash={ipfsHash}
                onContractCall={handleContractCall}
              />
            </div>

            {uploadedImageId !== null && (
              <div className="success-message">
                <h3>✅ 医疗影像上传完成!</h3>
                <div className="status-indicator status-success">
                  <span>📋</span>
                  <span>影像ID: <strong>{uploadedImageId}</strong></span>
                </div>
                <p>您的医疗影像已安全存储，现在可以进行授权访问和解密操作。</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="my-images-section">
          <h2>患者影像档案管理</h2>
          
          <div className="medical-alert status-warning">
            <div className="medical-alert-icon">👤</div>
            <div className="medical-alert-content">
              <h4>隐私保护</h4>
              <p>只显示您上传的医疗影像，所有数据均经过端到端加密保护。</p>
            </div>
          </div>
          
          <UserImageList onSelectImage={handleSelectImage} />
        </div>

        <div className="decrypt-section">
          <h2>影像解密与查看</h2>
          
          {selectedImageId && (
            <div className="selected-image-info">
              <p>🎯 当前选择的影像档案ID: <strong>{selectedImageId}</strong></p>
              <div className="status-indicator status-success">
                <span>✅</span>
                <span>已选择影像，可进行解密操作</span>
              </div>
            </div>
          )}
          
          {!selectedImageId && (
            <div className="medical-alert status-warning">
              <div className="medical-alert-icon">⚠️</div>
              <div className="medical-alert-content">
                <h4>请选择影像</h4>
                <p>请先从上方的影像档案列表中选择要解密的医疗影像。</p>
              </div>
            </div>
          )}
          
          <DecryptImage fhevmInstance={fhevmInstance} selectedImageId={selectedImageId} />
        </div>

        <div className="info-section">
          <h2>系统技术说明</h2>
          
          <div className="medical-alert status-info">
            <div className="medical-alert-icon">🔒</div>
            <div className="medical-alert-content">
              <h4>HIPAA合规性保障</h4>
              <p>本系统严格遵循HIPAA医疗数据保护法规，采用端到端加密技术保障患者隐私。</p>
            </div>
          </div>
          
          <div className="info-content">
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">⚙️</div>
                <h3 className="medical-card-title">系统工作原理</h3>
              </div>
              <ol>
                <li><strong>影像预处理:</strong> 对医疗影像进行标准化处理和质量检查</li>
                <li><strong>AES加密:</strong> 使用生成的EVM地址格式密钥进行AES-256加密</li>
                <li><strong>分布式存储:</strong> 将加密后的影像上传到IPFS分布式网络</li>
                <li><strong>同态加密:</strong> 使用Zama FHE技术对密钥进行同态加密</li>
                <li><strong>区块链存储:</strong> 加密密钥安全存储在以太坊区块链上</li>
                <li><strong>权限控制:</strong> 基于智能合约的细粒度访问控制</li>
                <li><strong>安全解密:</strong> 授权用户可解密并查看医疗影像</li>
              </ol>
            </div>
            
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🛡️</div>
                <h3 className="medical-card-title">安全技术栈</h3>
              </div>
              <ul>
                <li><strong>前端框架:</strong> React + TypeScript + Viem + RainbowKit</li>
                <li><strong>加密算法:</strong> Zama同态加密 + AES-256对称加密</li>
                <li><strong>存储层:</strong> IPFS分布式存储 + 以太坊区块链</li>
                <li><strong>身份验证:</strong> Web3钱包 + 数字签名验证</li>
                <li><strong>网络安全:</strong> TLS/SSL加密传输 + CORS保护</li>
                <li><strong>合规标准:</strong> HIPAA + GDPR数据保护标准</li>
              </ul>
            </div>

            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🏆</div>
                <h3 className="medical-card-title">安全优势</h3>
              </div>
              <ul>
                <li><strong>零知识证明:</strong> 验证数据完整性而不泄露内容</li>
                <li><strong>去中心化:</strong> 无单点故障，数据永久可用</li>
                <li><strong>细粒度授权:</strong> 精确控制数据访问权限</li>
                <li><strong>审计追踪:</strong> 所有操作均可追溯和审计</li>
                <li><strong>跨链兼容:</strong> 支持多链部署和数据迁移</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
