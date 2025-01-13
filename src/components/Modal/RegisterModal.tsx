import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './ModalAuth.module.css';

interface RegisterModalProps {
  onLoginClick: () => void;
  onRegisterSuccess: (redirectPath: string) => Promise<void>;
}

export const RegisterModal = ({ onLoginClick, onRegisterSuccess }: RegisterModalProps) => {
  const { publicKey } = useWallet();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!publicKey || !username || !role) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .single();

      if (existingUser) {
        setError('กระเป๋านี้ได้ลงทะเบียนไว้แล้ว');
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username,
            role,
            wallet_address: publicKey.toString(),
          },
        ]);

      if (insertError) throw insertError;

      // Redirect ตาม role
      const redirectPath = role === 'student' ? '/student-profile' : '/teacher-profile';
      await onRegisterSuccess(redirectPath);

    } catch (err) {
      console.error('Registration error:', err);
      setError('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1>ลงทะเบียนผู้ใช้ใหม่</h1>
      <p>กรุณาเชื่อมต่อกระเป๋า Phantom และกรอกข้อมูล</p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.buttonContainer}>
        <WalletMultiButton className={styles.walletButton} />

        {publicKey && (
          <>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
              className={styles.select}
            >
              <option value="student">นักเรียน</option>
              <option value="teacher">อาจารย์</option>
            </select>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={styles.registerButton}
            >
              {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </button>

          </>
        )}
      </div>
    </div>
  );
}; 