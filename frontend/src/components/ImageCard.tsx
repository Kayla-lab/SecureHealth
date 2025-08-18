import React from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

interface ImageCardProps {
  imageId: number;
  isSelected: boolean;
  onSelect: (imageId: number) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ imageId, isSelected, onSelect }) => {
  // 获取图片详细信息
  const { data: imageInfo, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getImageInfo',
    args: [BigInt(imageId)],
  });

  // 获取加密密码
  const { data: encryptedPassword, isError: passwordError, isLoading: passwordLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEncryptedPassword',
    args: [BigInt(imageId)],
  });

  const handleClick = () => {
    onSelect(imageId);
  };

  const formatTimestamp = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Loading...';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const uploader = imageInfo ? (imageInfo as [string, string, bigint])[0] : '';
  const imageHash = imageInfo ? (imageInfo as [string, string, bigint])[1] : '';
  const timestamp = imageInfo ? (imageInfo as [string, string, bigint])[2] : undefined;

  return (
    <div
      className={`image-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{
        border: `2px solid ${isSelected ? '#10b981' : '#e5e5e5'}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isSelected ? '#f0fdf4' : '#fafafa',
        boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#6366f1';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#e5e5e5';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <span style={{ fontWeight: 600, color: '#374151' }}>图片 ID:</span>
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#6366f1',
          background: '#f3f4f6',
          padding: '4px 8px',
          borderRadius: '6px'
        }}>
          {imageId}
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>上传者:</span>
          <span style={{ 
            color: '#374151', 
            fontSize: '12px', 
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxWidth: '150px'
          }}>
            {isLoading ? 'Loading...' : isError ? 'Error' : `${uploader.slice(0, 6)}...${uploader.slice(-4)}`}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>IPFS Hash:</span>
          <span style={{ 
            color: '#374151', 
            fontSize: '12px', 
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxWidth: '150px'
          }}>
            {isLoading ? 'Loading...' : isError ? 'Error' : `${imageHash.slice(0, 8)}...${imageHash.slice(-6)}`}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>上传时间:</span>
          <span style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>
            {isLoading ? 'Loading...' : isError ? 'Error' : formatTimestamp(timestamp)}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>加密密码:</span>
          <span style={{ 
            color: '#374151', 
            fontSize: '12px', 
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            maxWidth: '150px'
          }}>
            {passwordLoading ? 'Loading...' : passwordError ? 'Error' : `${(encryptedPassword as string)?.slice(0, 10)}...${(encryptedPassword as string)?.slice(-6)}`}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>状态:</span>
          <span style={{ color: '#10b981', fontSize: '14px' }}>✅ 活跃</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          style={{
            background: isSelected ? '#10b981' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isSelected ? '#059669' : '#4f46e5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isSelected ? '#10b981' : '#6366f1';
          }}
        >
          选择此图片
        </button>
      </div>
    </div>
  );
};