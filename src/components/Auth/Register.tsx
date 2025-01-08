import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './Login.module.css';

export const Register = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  useEffect(() => {
    if (!publicKey) {
      navigate('/login');
    }
  }, [publicKey, navigate]);

  const handleRegister = async () => {
    if (!publicKey || !username) return;

    const { data, error } = await supabase.from('users').insert([
      {
        wallet_address: publicKey.toString(),
        username,
        role,
      },
    ]);

    if (error) {
      console.error('Error registering user:', error);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>ลงทะเบียน</h1>
        <div className={styles.buttonContainer}>
          <WalletMultiButton className={styles.walletButton} />
        </div>
        {publicKey && (
          <div className={styles.formContainer}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้"
              className={styles.input}
            />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
              className={styles.select}
            >
              <option value="student">นักเรียน</option>
              <option value="teacher">ครู</option>
            </select>
            <button 
              onClick={handleRegister} 
              className={styles.registerButton}
            >
              ลงทะเบียน
            </button>
          </div>
        )}
      </div>
    </div>
  );
};