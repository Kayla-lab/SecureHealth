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

  // 模拟IPFS上传，生成假的IPFS hash
  const simulateIPFSUpload = async (data: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 基于数据内容生成稳定的假IPFS hash
    const hash = CryptoJS.SHA256(data).toString().substring(0, 46);
    return `Qm${hash}`;
  };

  const handleUpload = async () => {
    if (!encryptedImageData) {
      alert('没有加密图片数据，请先生成加密图片');
      return;
    }

    setIsUploading(true);
    
    try {
      // 模拟上传到IPFS
      const hash = await simulateIPFSUpload(encryptedImageData);
      setIpfsHash(hash);
      onUploadComplete?.(hash);
      
      console.log('模拟IPFS上传完成:', hash);
    } catch (error) {
      console.error('IPFS上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="ipfs-upload">
      <h3>IPFS上传 (模拟)</h3>
      
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
        {isUploading ? '上传中...' : '上传到IPFS'}
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
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginTop: '8px' 
          }}>
            注意: 这是模拟的IPFS hash，实际项目中需要连接真实的IPFS节点
          </p>
        </div>
      )}

      {!encryptedImageData && (
        <p style={{ color: '#dc3545', fontSize: '14px' }}>
          请先生成加密图片数据
        </p>
      )}
    </div>
  );
};