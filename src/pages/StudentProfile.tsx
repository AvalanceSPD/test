import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../utils/supabaseClient';
import styles from './Profile.module.css';

interface UserProfile {
  id: number;
  username: string;
  role: 'student' | 'teacher';
  wallet_address: string;
  created_at: string;
}

const StudentProfile = () => {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!publicKey) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const walletAddress = publicKey.toString();
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress)
          .eq('role', 'student')
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setUserProfile(data);
        } else {
          setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เนื่องจากไม่ใช่นักเรียน');
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        }

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [connected, publicKey, navigate]);

  const handleLogout = async () => {
    try {
      await disconnect();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>โปรไฟล์นักเรียน</h1>

        <div className={styles.walletSection}>
          <WalletMultiButton className={styles.walletButton} />
        </div>

        {isLoading && (
          <div className={styles.loading}>กำลังโหลดข้อมูล...</div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {userProfile && (
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ชื่อผู้ใช้:</span>
              <span className={styles.value}>{userProfile.username}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>บทบาท:</span>
              <span className={styles.value}>{userProfile.role}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>ที่อยู่กระเป๋า:</span>
              <span className={styles.value}>{userProfile.wallet_address}</span>
            </div>
          </div>
        )}

        {connected && (
          <button onClick={handleLogout} className={styles.logoutButton}>
            ออกจากระบบ
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;