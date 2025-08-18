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

  // 获取每个图片的详细信息
  useEffect(() => {
    const fetchImageInfos = async () => {
      if (!userImages.length) return;

      const infos: {[key: number]: {uploader: string, imageHash: string, timestamp: number}} = {};
      
      // 我们将使用多个 useReadContract 调用来获取每个图片的信息
      // 这里先设置加载状态
      for (const imageId of userImages) {
        infos[imageId] = {
          uploader: 'Loading...',
          imageHash: 'Loading...',
          timestamp: 0
        };
      }
      
      setImageInfos(infos);
    };

    fetchImageInfos();
  }, [userImages]);

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
              <div
                key={imageId}
                className={`image-card ${selectedImageId === imageId ? 'selected' : ''}`}
                onClick={() => handleSelectImage(imageId)}
              >
                <div className="image-id">
                  <span className="id-label">图片 ID:</span>
                  <span className="id-value">{imageId}</span>
                </div>
                
                <div className="image-details">
                  <div className="detail-row">
                    <span className="detail-label">上传时间:</span>
                    <span className="detail-value">
                      {imageInfos[imageId] ? 
                        (imageInfos[imageId].timestamp > 0 ? 
                          new Date(imageInfos[imageId].timestamp * 1000).toLocaleString() : 
                          'Loading...') : 
                        'Loading...'}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">状态:</span>
                    <span className="detail-value status-active">✅ 活跃</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="select-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectImage(imageId);
                    }}
                  >
                    选择此图片
                  </button>
                </div>
              </div>
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

      <style jsx>{`
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

        .image-card {
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }

        .image-card:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
          transform: translateY(-2px);
        }

        .image-card.selected {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .image-id {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e5e5;
        }

        .id-label {
          font-weight: 600;
          color: #374151;
        }

        .id-value {
          font-size: 18px;
          font-weight: bold;
          color: #6366f1;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .image-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .detail-label {
          color: #6b7280;
          font-size: 14px;
        }

        .detail-value {
          color: #374151;
          font-size: 14px;
          font-weight: 500;
        }

        .status-active {
          color: #10b981;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
        }

        .select-btn {
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .select-btn:hover {
          background: #4f46e5;
        }

        .image-card.selected .select-btn {
          background: #10b981;
        }

        .image-card.selected .select-btn:hover {
          background: #059669;
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
      `}</style>
    </div>
  );
};