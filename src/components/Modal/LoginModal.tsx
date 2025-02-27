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
  const [userRole, setUserRole] = useState<'student' | 'instructor' | null>(null);
 
  useEffect(() => {
    
    const checkExistingUser = async () => {
      if (!publicKey) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
            .rpc('check_role_in_navebar', {
              p_public_key:publicKey
            })
            if (error) console.error(error)
              
          if (error) {
            setUserRole(null);
            onRegisterClick();
          } if (data.is_instructor == true) {
            setUserRole('instructor');
            onLoginSuccess('/teacher-profile');
          } if (data.is_student == true) {
            setUserRole('student');
            onLoginSuccess('/student-profile');
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