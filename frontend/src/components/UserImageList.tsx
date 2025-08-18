import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { ImageCard } from './ImageCard';

interface UserImageListProps {
  onSelectImage?: (imageId: number) => void;
}

export const UserImageList: React.FC<UserImageListProps> = ({ onSelectImage }) => {
  const { address, isConnected } = useAccount();
  const [userImages, setUserImages] = useState<number[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  // 获取用户的图片ID列表
  const { data: userImageIds, refetch: refetchUserImages } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserImages',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    if (userImageIds) {
      const imageIdNumbers = (userImageIds as bigint[]).map(id => Number(id));
      setUserImages(imageIdNumbers);
    }
  }, [userImageIds]);

  const handleSelectImage = (imageId: number) => {
    setSelectedImageId(imageId);
    if (onSelectImage) {
      onSelectImage(imageId);
    }
  };

  const handleRefresh = () => {
    refetchUserImages();
  };

  if (!isConnected) {
    return (
      <div className="user-image-list">
        <p>请先连接钱包查看您的图片</p>
      </div>
    );
  }

  return (
    <div className="user-image-list">
      <div className="list-header">
        <h3>📋 我的图片列表</h3>
        <button onClick={handleRefresh} className="refresh-btn">
          🔄 刷新
        </button>
      </div>

      {userImages.length === 0 ? (
        <div className="empty-state">
          <p>您还没有上传任何图片</p>
          <p>请先上传一张图片到系统中</p>
        </div>
      ) : (
        <div className="image-list">
          <p className="list-count">共找到 {userImages.length} 张图片</p>
          
          <div className="image-grid">
            {userImages.map((imageId) => (
              <ImageCard
                key={imageId}
                imageId={imageId}
                isSelected={selectedImageId === imageId}
                onSelect={handleSelectImage}
              />
            ))}
          </div>
        </div>
      )}

      {selectedImageId !== null && (
        <div className="selected-info">
          <p>✅ 已选择图片 ID: <strong>{selectedImageId}</strong></p>
          <p>您可以使用此ID进行解密操作</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .user-image-list {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .list-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2em;
        }

        .refresh-btn {
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .empty-state p {
          margin: 8px 0;
        }

        .list-count {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .selected-info {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
          text-align: center;
        }

        .selected-info p {
          margin: 4px 0;
          color: #059669;
        }
      `}} />
    </div>
  );
};