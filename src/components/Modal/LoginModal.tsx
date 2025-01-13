import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './ModalAuth.module.css';

interface LoginModalProps {
  onRegisterClick: () => void;
  onLoginSuccess: (redirectPath: string) => Promise<void>;
}

export const LoginModal = ({ onRegisterClick, onLoginSuccess }: LoginModalProps) => {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingUser = async () => {
      if (!publicKey) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('role')
          .eq('wallet_address', publicKey.toString())
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // ไม่พบข้อมูลผู้ใช้ แสดงปุ่มลงทะเบียน
            onRegisterClick();
          } else {
            throw error;
          }
        }

        if (user) {
          // พบข้อมูลผู้ใช้ redirect ไปยังหน้า home ตามบทบาท
          switch (user.role) {
            case 'student':
              onLoginSuccess('/');  // จะแสดงหน้า home แบบ student
              break;
            case 'teacher':
              onLoginSuccess('/');  // จะแสดงหน้า home แบบ teacher
              break;
            default:
              onLoginSuccess('/');
          }
        }
      } catch (err) {
        console.error('Error checking user:', err);
        setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingUser();
  }, [publicKey]);

  // ลบส่วน UI ที่ไม่จำเป็น เพราะจะ redirect ทันทีเมื่อพบข้อมูลผู้ใช้
  return (
    <div className={styles.authContainer}>
      <h1>เชื่อมต่อกระเป๋า</h1>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.buttonContainer}>
        <WalletMultiButton className={styles.walletButton} />
        {isLoading && (
          <div className={styles.loadingMessage}>
            กำลังตรวจสอบข้อมูล...
          </div>
        )}
      </div>
    </div>
  );
}; 