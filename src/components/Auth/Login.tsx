import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './Login.module.css';

interface LoginProps {
  onRegisterClick: () => void;
}

export const Login = ({ onRegisterClick }: LoginProps) => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!publicKey) {
        setIsNewUser(false);
        setHasAccount(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setIsNewUser(true);
            setHasAccount(false);
          } else {
            throw error;
          }
        }

        if (user) {
          setHasAccount(true);
          setIsNewUser(false);
        }

      } catch (err) {
        console.error('Error checking user:', err);
        setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [publicKey]);

  const handleLogin = async () => {
    if (!publicKey) return;
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('wallet_address', publicKey.toString())
        .single();
      
      if (error) throw error;
      
      if (user) {
        switch (user.role) {
          case 'student':
            navigate('/student-profile');
            break;
          case 'teacher':
            navigate('/teacher-profile');
            break;
          default:
            navigate('/profile');
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>เข้าสู่ระบบ</h1>
        <p>กรุณาเชื่อมต่อกระเป๋า Phantom เพื่อเข้าสู่ระบบ</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.buttonContainer}>
          <WalletMultiButton className={styles.walletButton} />
          
          {isLoading && (
            <div className={styles.loadingMessage}>
              กำลังตรวจสอบข้อมูล...
            </div>
          )}

          {publicKey && !isLoading && (
            <>
              {hasAccount && (
                <button 
                  onClick={handleLogin}
                  className={styles.loginButton}
                >
                  เข้าสู่ระบบ
                </button>
              )}
              
              {isNewUser && (
                <>
                  <button 
                    onClick={handleRegister}
                    className={styles.registerButton}
                  >
                    ลงทะเบียนผู้ใช้ใหม่
                  </button>
                  <div className={styles.newUserMessage}>
                    คุณยังไม่มีบัญชีผู้ใช้ กรุณาลงทะเบียนเพื่อเข้าใช้งาน
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 