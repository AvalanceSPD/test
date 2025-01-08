import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './Login.module.css';

export const Login = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  useEffect(() => {
    const checkUser = async () => {
      if (!publicKey) return;

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .single();

      if (user) {
        navigate('/dashboard');
      }
    };

    checkUser();
  }, [publicKey, navigate]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>เข้าสู่ระบบ</h1>
        <p>กรุณาเชื่อมต่อกระเป๋า Phantom เพื่อเข้าสู่ระบบ</p>
        <div className={styles.buttonContainer}>
          <WalletMultiButton className={styles.walletButton} />
          {publicKey && (
            <button 
              onClick={handleRegister}
              className={styles.registerButton}
            >
              ลงทะเบียนผู้ใช้ใหม่
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 