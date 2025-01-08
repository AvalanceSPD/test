import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './Profile.module.css';

interface UserProfile {
  id: number;
  username: string;
  role: 'student' | 'teacher';
  wallet_address: string;
  created_at: string;
}

export const Profile = () => {
  const { publicKey, disconnect } = useWallet();
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

        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .single()
          .throwOnError();

        console.log('Wallet address:', publicKey.toString());
        console.log('Query result:', { data, error: fetchError });

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        setUserProfile(data);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [publicKey, navigate]);

  const handleLogout = async () => {
    try {
      await disconnect();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  console.log('Current state:', {
    publicKey: publicKey?.toString(),
    isLoading,
    error,
    userProfile
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>โปรไฟล์ของฉัน</h1>
        
        <div className={styles.walletSection}>
          <WalletMultiButton className={styles.walletButton} />
          <div className={styles.debug}>
            Wallet: {publicKey?.toString()}
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              ลองใหม่อีกครั้ง
            </button>
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
              <span className={`${styles.value} ${styles.roleBadge} ${styles[userProfile.role]}`}>
                {userProfile.role === 'student' ? 'นักเรียน' : 'ครู'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>ที่อยู่กระเป๋า:</span>
              <span className={styles.value}>
                {userProfile.wallet_address.slice(0, 6)}...
                {userProfile.wallet_address.slice(-4)}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>วันที่สมัคร:</span>
              <span className={styles.value}>
                {new Date(userProfile.created_at).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className={styles.logoutButton}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}; 