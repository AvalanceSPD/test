import React, { useState } from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength: number; // ความยาวสูงสุดของข้อความที่ต้องการแสดง
}

export const CopyButton: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
  const [isCopied, setIsCopied] = useState(false);

  // ฟังก์ชันตัดข้อความให้สั้นลง
  const truncatedText = text.length > maxLength ? `${text.slice(0, maxLength)} ...` : text;

  // ฟังก์ชันคัดลอกข้อความ
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text); // คัดลอกข้อความทั้งหมด
      setIsCopied(true); // ตั้งค่าสถานะเป็น "คัดลอกแล้ว"
      setTimeout(() => setIsCopied(false), 2000); // รีเซ็ตสถานะหลังจาก 2 วินาที
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleCopy} >
      <button onClick={handleCopy} style={{ backgroundColor: '#8e8e8e', padding: '4px 8px', fontSize: '14px', }}>
        {/* <span>{truncatedText}</span> */}
        {isCopied ? 'คัดลอกแล้ว' : truncatedText}
        {/* {isCopied ? 'คัดลอกแล้ว!' : 'คัดลอก'} */}
      </button>
    </div>
  );
};