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
  
  // Step status
  const [step1Complete, setStep1Complete] = useState(false); // Image loading complete
  const [step2Complete, setStep2Complete] = useState(false); // Password generation complete
  const [step3Complete, setStep3Complete] = useState(false); // AES encryption complete

  // Generate EVM address format password
  const generateEvmPassword = () => {
    // Generate 40-bit hexadecimal string with 0x prefix
    const hexString = CryptoJS.lib.WordArray.random(20).toString();
    return '0x' + hexString;
  };

  // Convert image to Base64
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

  // AES encrypt image
  const encryptImage = async (imageBase64: string, password: string) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(imageBase64, password).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  };

  // Generate encrypted scrambled image display
  const generateEncryptedImageDisplay = (encryptedData: string) => {
    // Convert encrypted data to visualized scrambled image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 400;
    canvas.height = 300;

    // Generate random pixels using encrypted data
    const imageData = ctx.createImageData(400, 300);
    const data = imageData.data;

    // Use encrypted string to generate pseudo-random data
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

  // Load original image
  const loadOriginalImage = async () => {
    try {
      const imageBase64 = await imageToBase64('/CT.jpeg');
      setOriginalImageBase64(imageBase64);
      setOriginalImage('data:image/jpeg;base64,' + imageBase64);
      setStep1Complete(true);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  // Generate random password
  const handleGeneratePassword = () => {
    const newPassword = generateEvmPassword();
    setPassword(newPassword);
    onPasswordGenerated?.(newPassword);
    setStep2Complete(true);
  };

  // Handle AES encryption
  const handleAESEncrypt = async () => {
    if (!originalImageBase64 || !password) return;
    
    try {
      // Encrypt image
      const encrypted = await encryptImage(originalImageBase64, password);
      
      // Generate scrambled image display
      const encryptedImageDisplay = generateEncryptedImageDisplay(encrypted);
      setEncryptedImage(encryptedImageDisplay);
      
      onEncryptedImageGenerated?.(encrypted);
      setStep3Complete(true);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  // Reset all states
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
    // Automatically load original image when component loads
    loadOriginalImage();
  }, []);

  return (
    <div className="image-display">
      {/* Step 1: Display original image */}
      <div className="step-section">
        <h4>📸 Original Image</h4>
        {originalImage ? (
          <img src={originalImage} alt="Original Image" style={{ maxWidth: '300px', height: 'auto', border: '1px solid #ddd', borderRadius: '8px' }} />
        ) : (
          <div className="loading">Loading...</div>
        )}
        {step1Complete && (
          <div style={{ marginTop: '10px', color: '#28a745', fontSize: '14px' }}>
            ✅ Image loading complete
          </div>
        )}
      </div>

      {/* Step 2: Generate random password */}
      <div className="step-section" style={{ marginTop: '20px' }}>
        <h4>🔑 Generate EVM Address Format Password</h4>
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
              ✅ Password generation complete
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
            Generate Random Password
          </button>
        )}
      </div>

      {/* Step 3: AES encrypt image */}
      <div className="step-section" style={{ marginTop: '20px' }}>
        <h4>🔐 AES Encrypt Image</h4>
        {step3Complete ? (
          <div>
            <img 
              src={encryptedImage} 
              alt="Encrypted scrambled image" 
              style={{ 
                maxWidth: '300px', 
                height: 'auto',
                border: '1px solid #ddd', 
                borderRadius: '8px' 
              }} 
            />
            <div style={{ marginTop: '10px', color: '#28a745', fontSize: '14px' }}>
              ✅ AES encryption complete
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
            AES Encrypt Image
          </button>
        ) : (
          <div style={{ color: '#6c757d', fontSize: '14px' }}>
            Please generate password first
          </div>
        )}
      </div>

      {/* Reset button */}
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
            Restart
          </button>
        </div>
      )}
    </div>
  );
};