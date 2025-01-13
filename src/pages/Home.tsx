import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้</h1>
        <p className={styles.subtitle}>
          เรียนรู้และพัฒนาทักษะของคุณผ่านบทเรียนออนไลน์ที่หลากหลาย
        </p>
        {!connected && (
          <button 
            onClick={handleGetStarted} 
            className={styles.getStartedButton}
          >
            เริ่มต้นใช้งาน
          </button>
        )}
      </div>
    </div>
  );
};

export default Home; 