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
  const [originalImageBase64, setOriginalImageBase64] = useState<string>('');
  
  // 步骤状态
  const [step1Complete, setStep1Complete] = useState(false); // 图片加载完成
  const [step2Complete, setStep2Complete] = useState(false); // 密码生成完成
  const [step3Complete, setStep3Complete] = useState(false); // AES加密完成

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

  // 加载原始图片
  const loadOriginalImage = async () => {
    try {
      const imageBase64 = await imageToBase64('/CT.jpeg');
      setOriginalImageBase64(imageBase64);
      setOriginalImage('data:image/jpeg;base64,' + imageBase64);
      setStep1Complete(true);
    } catch (error) {
      console.error('加载图片失败:', error);
    }
  };

  // 生成随机密码
  const handleGeneratePassword = () => {
    const newPassword = generateEvmPassword();
    setPassword(newPassword);
    onPasswordGenerated?.(newPassword);
    setStep2Complete(true);
  };

  // 处理AES加密
  const handleAESEncrypt = async () => {
    if (!originalImageBase64 || !password) return;
    
    try {
      // 加密图片
      const encrypted = await encryptImage(originalImageBase64, password);
      
      // 生成乱码图片显示
      const encryptedImageDisplay = generateEncryptedImageDisplay(encrypted);
      setEncryptedImage(encryptedImageDisplay);
      
      onEncryptedImageGenerated?.(encrypted);
      setStep3Complete(true);
    } catch (error) {
      console.error('加密失败:', error);
    }
  };

  // 重置所有状态
  const resetSteps = () => {
    setOriginalImage('');
    setEncryptedImage('');
    setPassword('');
    setOriginalImageBase64('');
    setStep1Complete(false);
    setStep2Complete(false);
    setStep3Complete(false);
  };

  useEffect(() => {
    // 组件加载时自动加载原始图片
    loadOriginalImage();
  }, []);

  return (
    <div className="image-display">
      {/* 步骤1: 显示原始图片 */}
      <div className="step-section">
        <h4>📸 原始图片</h4>
        {originalImage ? (
          <img src={originalImage} alt="原始图片" style={{ maxWidth: '300px', height: 'auto', border: '1px solid #ddd', borderRadius: '8px' }} />
        ) : (
          <div className="loading">加载中...</div>
        )}
        {step1Complete && (
          <div style={{ marginTop: '10px', color: '#28a745', fontSize: '14px' }}>
            ✅ 图片加载完成
          </div>
        )}
      </div>

      {/* 步骤2: 生成随机密码 */}
      <div className="step-section" style={{ marginTop: '20px' }}>
        <h4>🔑 生成EVM地址格式密码</h4>
        {step2Complete ? (
          <div>
            <code style={{ 
              background: '#f8f9fa', 
              padding: '12px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              display: 'block',
              border: '1px solid #e9ecef'
            }}>
              {password}
            </code>
            <div style={{ marginTop: '10px', color: '#28a745', fontSize: '14px' }}>
              ✅ 密码生成完成
            </div>
          </div>
        ) : (
          <button 
            onClick={handleGeneratePassword}
            disabled={!step1Complete}
            style={{
              padding: '12px 24px',
              backgroundColor: step1Complete ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: step1Complete ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            生成随机密码
          </button>
        )}
      </div>

      {/* 步骤3: AES加密图片 */}
      <div className="step-section" style={{ marginTop: '20px' }}>
        <h4>🔐 AES加密图片</h4>
        {step3Complete ? (
          <div>
            <img 
              src={encryptedImage} 
              alt="加密后的乱码图片" 
              style={{ 
                maxWidth: '300px', 
                height: 'auto',
                border: '1px solid #ddd', 
                borderRadius: '8px' 
              }} 
            />
            <div style={{ marginTop: '10px', color: '#28a745', fontSize: '14px' }}>
              ✅ AES加密完成
            </div>
          </div>
        ) : step2Complete ? (
          <button 
            onClick={handleAESEncrypt}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            AES加密图片
          </button>
        ) : (
          <div style={{ color: '#6c757d', fontSize: '14px' }}>
            请先生成密码
          </div>
        )}
      </div>

      {/* 重置按钮 */}
      {(step2Complete || step3Complete) && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            onClick={resetSteps}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            重新开始
          </button>
        </div>
      )}
    </div>
  );
};