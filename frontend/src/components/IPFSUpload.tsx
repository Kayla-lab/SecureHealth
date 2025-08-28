import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

interface IPFSUploadProps {
  encryptedImageData?: string;
  onUploadComplete?: (ipfsHash: string) => void;
}

export const IPFSUpload: React.FC<IPFSUploadProps> = ({
  encryptedImageData,
  onUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string>('');

  // Simulate IPFS upload, generate fake IPFS hash
  const simulateIPFSUpload = async (data: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate stable fake IPFS hash based on data content
    const hash = CryptoJS.SHA256(data).toString().substring(0, 46);
    return `Qm${hash}`;
  };

  const handleUpload = async () => {
    if (!encryptedImageData) {
      alert('No encrypted image data, please generate encrypted image first');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload to IPFS
      const hash = await simulateIPFSUpload(encryptedImageData);
      setIpfsHash(hash);
      onUploadComplete?.(hash);
      
      console.log('Simulated IPFS upload complete:', hash);
    } catch (error) {
      console.error('IPFS upload failed:', error);
      alert('Upload failed, please try again');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="ipfs-upload">
      <h3>IPFS Upload</h3>
      
      <button
        onClick={handleUpload}
        disabled={isUploading || !encryptedImageData}
        style={{
          padding: '12px 24px',
          backgroundColor: isUploading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {isUploading ? 'Uploading...' : 'Upload to IPFS'}
      </button>

      {ipfsHash && (
        <div className="ipfs-result">
          <h4>IPFS Hash:</h4>
          <code style={{
            background: '#e9ecef',
            padding: '8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            display: 'block',
            marginTop: '8px'
          }}>
            {ipfsHash}
          </code>
        </div>
      )}

      {!encryptedImageData && (
        <p style={{ color: '#dc3545', fontSize: '14px' }}>
          Please generate encrypted image data first
        </p>
      )}
    </div>
  );
};