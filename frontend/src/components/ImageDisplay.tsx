import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

interface ImageDisplayProps {
  onPasswordGenerated?: (password: string) => void;
  onEncryptedImageGenerated?: (encryptedBase64: string) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  onPasswordGenerated,
  onEncryptedImageGenerated
}) => {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [encryptedImage, setEncryptedImage] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // 生成EVM地址格式的密码
  const generateEvmPassword = () => {
    // 生成40位十六进制字符串，前加0x
    const hexString = CryptoJS.lib.WordArray.random(20).toString();
    return '0x' + hexString;
  };

  // 将图片转换为Base64
  const imageToBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  // AES加密图片
  const encryptImage = async (imageBase64: string, password: string) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(imageBase64, password).toString();
      return encrypted;
    } catch (error) {
      console.error('加密失败:', error);
      throw error;
    }
  };

  // 生成加密后的乱码图片显示
  const generateEncryptedImageDisplay = (encryptedData: string) => {
    // 将加密数据转换为可视化的乱码图片
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 400;
    canvas.height = 300;

    // 用加密数据生成随机像素
    const imageData = ctx.createImageData(400, 300);
    const data = imageData.data;

    // 使用加密字符串生成伪随机数据
    const hash = CryptoJS.SHA256(encryptedData).toString();
    let hashIndex = 0;

    for (let i = 0; i < data.length; i += 4) {
      const hashChar = hash[hashIndex % hash.length];
      const value = parseInt(hashChar, 16) * 16;
      
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A
      
      hashIndex++;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  // 处理加密过程
  const handleEncrypt = async () => {
    try {
      if (!originalImage) {
        // 加载原始图片
        const imageBase64 = await imageToBase64('/CT.jpeg');
        setOriginalImage('data:image/jpeg;base64,' + imageBase64);

        // 生成密码
        const newPassword = generateEvmPassword();
        setPassword(newPassword);
        onPasswordGenerated?.(newPassword);

        // 加密图片
        const encrypted = await encryptImage(imageBase64, newPassword);
        
        // 生成乱码图片显示
        const encryptedImageDisplay = generateEncryptedImageDisplay(encrypted);
        setEncryptedImage(encryptedImageDisplay);
        
        onEncryptedImageGenerated?.(encrypted);
      }
    } catch (error) {
      console.error('处理失败:', error);
    }
  };

  useEffect(() => {
    // 组件加载时自动处理图片
    handleEncrypt();
  }, []);

  return (
    <div className="image-display">
      <div className="image-section">
        <h3>原始图片</h3>
        {originalImage ? (
          <img src={originalImage} alt="原始图片" style={{ maxWidth: '300px', height: 'auto' }} />
        ) : (
          <div className="loading">加载中...</div>
        )}
      </div>

      <div className="image-section">
        <h3>AES加密后的图片 (乱码显示)</h3>
        {encryptedImage ? (
          <img src={encryptedImage} alt="加密后的乱码图片" style={{ maxWidth: '300px', height: 'auto' }} />
        ) : (
          <div className="loading">生成中...</div>
        )}
      </div>

      <div className="password-section">
        <h3>生成的EVM地址密码</h3>
        <code style={{ 
          background: '#f0f0f0', 
          padding: '8px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          wordBreak: 'break-all'
        }}>
          {password || '生成中...'}
        </code>
      </div>

      <button 
        onClick={handleEncrypt} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        重新生成密码和加密
      </button>
    </div>
  );
};