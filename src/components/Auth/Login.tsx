import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
    <div className={styles.container}>
      <h1>�ข้าสู่ระบบ</h1>
      {location.state?.from && (
        <div className={styles.message}>
          กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
        </div>
      )}
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <p>Please connect your Phantom Wallet to log in.</p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.buttonContainer}>
            <WalletMultiButton className={styles.walletButton} />
            
            {isLoading && (
              <div className={styles.loadingMessage}>
                Checking information...
              </div>
            )}

            {publicKey && !isLoading && (
              <>
                {hasAccount && (
                  <button 
                    onClick={handleLogin}
                    className={styles.loginButton}
                  >
                    Login
                  </button>
                )}
                
                {isNewUser && (
                  <>
                    <button 
                      onClick={handleRegister}
                      className={styles.registerButton}
                    >
                      Register new user
                    </button>
                    <div className={styles.newUserMessage}>
                      You don't have an account yet. Please register to use it.
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 