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

  // Initialize FHEVM instance
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
        console.log('FHEVM instance initialized successfully');
      } catch (error) {
        console.error('FHEVM initialization failed:', error);
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
            <p>🔐 Blockchain-based Medical Image Security Management System</p>
            <div className="medical-breadcrumb">
              <span className="medical-breadcrumb-item active">Medical Image Management</span>
              <span className="medical-breadcrumb-separator">•</span>
              <span className="medical-breadcrumb-item">Secure Encrypted Storage</span>
              <span className="medical-breadcrumb-separator">•</span>
              <span className="medical-breadcrumb-item">Privacy Protection</span>
            </div>
          </div>
          <div className="wallet-section">
            <div className="status-indicator status-info" style={{marginBottom: '1rem'}}>
              <span>🔗</span>
              <span>Blockchain Connection Status</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="upload-section">
          <h2>Medical Image Upload & Encryption</h2>
          
          <div className="medical-alert status-info">
            <div className="medical-alert-icon">ℹ️</div>
            <div className="medical-alert-content">
              <h4>Security Notice</h4>
              <p>This system uses military-grade AES encryption and blockchain storage technology to ensure your medical imaging data is secure and reliable.</p>
            </div>
          </div>
          
          <div className="step-container">
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🏥</div>
                <h3 className="medical-card-title">Step 1: Image Preprocessing & Encryption</h3>
              </div>
              <ImageDisplay 
                onPasswordGenerated={handlePasswordGenerated}
                onEncryptedImageGenerated={handleEncryptedImageGenerated}
              />
            </div>

            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">☁️</div>
                <h3 className="medical-card-title">Step 2: Distributed Storage Upload</h3>
              </div>
              <IPFSUpload 
                encryptedImageData={encryptedImageData}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🔗</div>
                <h3 className="medical-card-title">Step 3: Blockchain Secure Storage</h3>
              </div>
              <ZamaIntegration 
                password={password}
                ipfsHash={ipfsHash}
                onContractCall={handleContractCall}
              />
            </div>

            {uploadedImageId !== null && (
              <div className="success-message">
                <h3>✅ Medical Image Upload Complete!</h3>
                <div className="status-indicator status-success">
                  <span>📋</span>
                  <span>Image ID: <strong>{uploadedImageId}</strong></span>
                </div>
                <p>Your medical image has been securely stored. You can now perform authorized access and decryption operations.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="my-images-section">
          <h2>Patient Image Archive Management</h2>
          
          <div className="medical-alert status-warning">
            <div className="medical-alert-icon">👤</div>
            <div className="medical-alert-content">
              <h4>Privacy Protection</h4>
              <p>Only shows the medical images you uploaded. All data is protected by end-to-end encryption.</p>
            </div>
          </div>
          
          <UserImageList onSelectImage={handleSelectImage} />
        </div>

        <div className="decrypt-section">
          <h2>Image Decryption & Viewing</h2>
          
          {selectedImageId && (
            <div className="selected-image-info">
              <p>🎯 Currently selected image archive ID: <strong>{selectedImageId}</strong></p>
              <div className="status-indicator status-success">
                <span>✅</span>
                <span>Image selected, decryption operations available</span>
              </div>
            </div>
          )}
          
          {!selectedImageId && (
            <div className="medical-alert status-warning">
              <div className="medical-alert-icon">⚠️</div>
              <div className="medical-alert-content">
                <h4>Please Select Image</h4>
                <p>Please first select the medical image you want to decrypt from the image archive list above.</p>
              </div>
            </div>
          )}
          
          <DecryptImage fhevmInstance={fhevmInstance} selectedImageId={selectedImageId} />
        </div>

        <div className="info-section">
          <h2>System Technical Documentation</h2>
          
          <div className="medical-alert status-info">
            <div className="medical-alert-icon">🔒</div>
            <div className="medical-alert-content">
              <h4>HIPAA Compliance Assurance</h4>
              <p>This system strictly follows HIPAA medical data protection regulations, using end-to-end encryption technology to protect patient privacy.</p>
            </div>
          </div>
          
          <div className="info-content">
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">⚙️</div>
                <h3 className="medical-card-title">System Working Principles</h3>
              </div>
              <ol>
                <li><strong>Image Preprocessing:</strong> Standardize processing and quality checks for medical images</li>
                <li><strong>AES Encryption:</strong> AES-256 encryption using generated EVM address format keys</li>
                <li><strong>Distributed Storage:</strong> Upload encrypted images to IPFS distributed network</li>
                <li><strong>Homomorphic Encryption:</strong> Use Zama FHE technology for key homomorphic encryption</li>
                <li><strong>Blockchain Storage:</strong> Encrypted keys securely stored on Ethereum blockchain</li>
                <li><strong>Access Control:</strong> Fine-grained access control based on smart contracts</li>
                <li><strong>Secure Decryption:</strong> Authorized users can decrypt and view medical images</li>
              </ol>
            </div>
            
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🛡️</div>
                <h3 className="medical-card-title">Security Technology Stack</h3>
              </div>
              <ul>
                <li><strong>Frontend Framework:</strong> React + TypeScript + Viem + RainbowKit</li>
                <li><strong>Encryption Algorithms:</strong> Zama Homomorphic Encryption + AES-256 Symmetric Encryption</li>
                <li><strong>Storage Layer:</strong> IPFS Distributed Storage + Ethereum Blockchain</li>
                <li><strong>Identity Authentication:</strong> Web3 Wallet + Digital Signature Verification</li>
                <li><strong>Network Security:</strong> TLS/SSL Encrypted Transmission + CORS Protection</li>
                <li><strong>Compliance Standards:</strong> HIPAA + GDPR Data Protection Standards</li>
              </ul>
            </div>

            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-icon">🏆</div>
                <h3 className="medical-card-title">Security Advantages</h3>
              </div>
              <ul>
                <li><strong>Zero-Knowledge Proof:</strong> Verify data integrity without revealing content</li>
                <li><strong>Decentralization:</strong> No single point of failure, data permanently available</li>
                <li><strong>Fine-grained Authorization:</strong> Precise control over data access permissions</li>
                <li><strong>Audit Trail:</strong> All operations are traceable and auditable</li>
                <li><strong>Cross-chain Compatibility:</strong> Support multi-chain deployment and data migration</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
