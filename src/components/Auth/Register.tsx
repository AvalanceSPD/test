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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      navigate('/login');
    }
  }, [publicKey, navigate]);

  const handleRegister = async () => {
    if (!publicKey || !username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // เช็คว่า username ซ้ำหรือไม่
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking username:', checkError);
        setError(`เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้: ${checkError.message}`);
        return;
      }

      if (existingUser) {
        setError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
        return;
      }

      // เพิ่มข้อมูลผู้ใช้ใหม่
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            wallet_address: publicKey.toString(),
            username: username.trim(),
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      // แสดงข้อความสำเร็จและรอสักครู่ก่อนกลับไปหน้า login
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setIsLoading(false);
    }
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
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && (
              <div className={styles.successMessage}>
                ลงทะเบียนสำเร็จ! กำลังกลับไปยังหน้าเข้าสู่ระบบ...
              </div>
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้"
              className={styles.input}
              disabled={isLoading || success}
              minLength={3}
              maxLength={30}
            />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
              className={styles.select}
              disabled={isLoading || success}
            >
              <option value="student">นักเรียน</option>
              <option value="teacher">ครู</option>
            </select>
            <button 
              onClick={handleRegister} 
              className={styles.registerButton}
              disabled={isLoading || success || !username.trim()}
            >
              {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};