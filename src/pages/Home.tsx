import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../utils/supabaseClient';
import styles from './Home.module.css';

interface UserData {
  role: 'student' | 'teacher' | null;
  username: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      if (publicKey && connected) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role, username')
            .eq('wallet_address', publicKey.toString())
            .single();

          if (error) throw error;
          setUserData(data);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [publicKey, connected]);

  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลด...</div>;
  }

  // หน้า Home สำหรับนักเรียน
  if (userData?.role === 'student') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>ยินดีต้อนรับ {userData.username}</h1>
          <div className={styles.studentDashboard}>
            <div className={styles.section}>
              <h2>คอร์สเรียนของฉัน</h2>
              {/* แสดงรายการคอร์สที่ลงทะเบียน */}
              <div className={styles.courseGrid}>
                {/* ตัวอย่างคอร์ส */}
                <div className={styles.courseCard}>
                  <h3>คอร์ส A</h3>
                  <button onClick={() => navigate('/course/1')}>
                    เข้าเรียน
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <h2>คอร์สแนะนำ</h2>
              {/* แสดงคอร์สแนะนำ */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // หน้า Home สำหรับอาจารย์
  if (userData?.role === 'teacher') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>ยินดีต้อนรับ อาจารย์ {userData.username}</h1>
          <div className={styles.teacherDashboard}>
            <div className={styles.section}>
              <h2>คอร์สที่สอน</h2>
              <button 
                className={styles.createButton}
                onClick={() => navigate('/create-course')}
              >
                สร้างคอร์สใหม่
              </button>
              {/* แสดงรายการคอร์สที่สอน */}
              <div className={styles.courseGrid}>
                {/* ตัวอย่างคอร์ส */}
                <div className={styles.courseCard}>
                  <h3>คอร์ส X</h3>
                  <button onClick={() => navigate('/course/1/edit')}>
                    จัดการคอร์ส
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // หน้า Home สำหรับ Guest
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้</h1>
        <p className={styles.subtitle}>
          เรียนรู้และพัฒนาทักษะของคุณผ่านบทเรียนออนไลน์ที่หลากหลาย
        </p>
      </div>
    </div>
  );
};

export default Home; 