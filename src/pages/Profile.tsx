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

const Profile = () => {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logs for wallet connection
  useEffect(() => {
    console.log('Wallet connection status:', {
      connected,
      publicKey: publicKey?.toString(),
      walletName: wallet?.adapter.name,
      wallet: wallet,
      readyState: wallet?.adapter.readyState,
    });
  }, [connected, publicKey, wallet]);

  useEffect(() => {
    const checkWalletConnection = () => {
      if (!connected || !publicKey) {
        console.log('No wallet connected, redirecting to login...');
        navigate('/login');
        return false;
      }
      return true;
    };

    const fetchUserProfile = async () => {
      if (!publicKey) {
        console.log('No wallet connected');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const walletAddress = publicKey.toString();
        console.log('Connected wallet address:', walletAddress);

        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress);

        console.log('Supabase query result:', { data, error: fetchError });

        if (fetchError) {
          throw fetchError;
        }

        if (data && data.length > 0) {
          setUserProfile(data[0]);
        } else {
          setError('ไม่พบข้อมูลผู้ใช้');
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
      console.log('Logging out...');
      await disconnect();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>โปรไฟล์ของฉัน</h1>

        {/* Wallet Connection Debug Info */}
        <div className={styles.debugInfo}>
          <h3>Wallet Debug Info:</h3>
          <p>Connection Status: {connected ? 'Connected' : 'Disconnected'}</p>
          <p>Wallet Name: {wallet?.adapter.name || 'None'}</p>
          <p>Wallet Address: {publicKey?.toString() || 'None'}</p>
          <p>Ready State: {wallet?.adapter.readyState || 'Unknown'}</p>
        </div>

        <div className={styles.walletSection}>
          <WalletMultiButton className={styles.walletButton} />
        </div>

        {isLoading && (
          <div className={styles.loading}>กำลังโหลดข้อมูล...</div>
        )}

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

export default Profile; 