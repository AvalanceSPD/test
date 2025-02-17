import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../utils/supabaseClient';
import styles from './Login.module.css';
import bs58 from 'bs58';
import { sign } from 'tweetnacl';

interface insID {
    ins_id: string;
}

export const InsRegister = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [ins_id, setInsid] = useState<insID | undefined>();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     if (!publicKey) {
//       navigate('/login');
//     }
//   }, [publicKey, navigate]);

  const handleRegister = async () => {
    if (!publicKey || !username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // เชิ่มกยืนยันตัวตนด้วย wallet
      const message = `ยืนยันการลงทะเบียนบัญชี ${username.trim()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // ขอลายเซ็นจากผู้ใช้
      let signature: Uint8Array;
      try {
        // แก้ไขกรับลายเซ็นและแปลงเป็น Uint8Array
        const signatureResponse = await (window as any).solana.signMessage(encodedMessage, 'utf8');
        signature = new Uint8Array(signatureResponse.signature);
      } catch (signError) {
        setError('กรุณายืนยันการลงทะเบียนด้วยการเซ็นข้อความ');
        return;
      }

      // ตรวจสอบลายเซ็น
      const verified = sign.detached.verify(
        encodedMessage,
        signature,
        publicKey.toBytes()
      );

      if (!verified) {
        setError('การยืนยันตัวตนล้มเหลว');
        return;
      }

      //> ตรวจสอบ wallet address
      const { data: existingWallet, error: walletError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('wallet_address', publicKey.toString())
        .maybeSingle();

      if (walletError) {
        console.error('Error checking wallet:', walletError);
        setError(`เกิดข้อผิดพลาดในการตรวจสอบกระเป๋าเงิน: ${walletError.message}`);
        return;
      }

      if (existingWallet) {
        setError('กระเป๋าเงินนี้ได้ลงทะเบียนไปแล้ว');
        return;
      }

      //> ตรวจสอบ username
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.trim())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking username:', checkError);
        setError(`เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้: ${checkError.message}`);
        return;
      }

      if (existingUser) {
        setError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
        return;
      }

      //: เพิ่มข้อมูลผู้ใช้ใหม่พร้อมลายเซ็น
      const { data:rpcdata, error:rpcerror } = await supabase
        .rpc('create_ins', {
          p_ins_name:fullname, 
          p_signature:bs58.encode(signature), 
          p_username:username.trim(), 
          p_wallet_address:publicKey.toString()
        })
      if (rpcerror) {
          console.error(rpcerror)
          throw rpcerror;
      }
      else console.log(rpcdata)
      
    //   const { error: userError } = await supabase
    //     .from('users')
    //     .insert([
    //       {
    //         wallet_address: publicKey.toString(),
    //         username: username.trim(),
    //         signature: bs58.encode(signature),
    //         created_at: new Date().toISOString(),
    //         updated_at: new Date().toISOString()
    //       }
    //     ]);
    //     if (userError) {
    //         throw userError;
    //     }
        
    //     const { data: users_id, error } = await supabase
    //     .from('users')
    //     .select('id')
    //     .eq('wallet_address', publicKey.toString())
        
    //     if (users_id && users_id.length > 0) {
    //         setInsid(users_id[0].id);
    //     }
    //     const { error: insertError } = await supabase
    //     .from('instructors_list')
    //     .insert([
    //         {
    //         ins_name:fullname,
    //         ins_id: ins_id,
    //         created_at: new Date().toISOString(),
    //         }
    //     ]);
    //     if (insertError) {
    //     throw insertError;
    //     }
    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);

      //> แสดงข้อความสำเร็จและรอสักครู่ก่อนกลับไปหน้า login

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
              placeholder="Username"
              className={styles.input}
              disabled={isLoading || success}
              minLength={3}
              maxLength={30}
            />
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Full name"
              className={styles.input}
              disabled={isLoading || success}
              minLength={3}
              maxLength={30}
            />
            {/* <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
              className={styles.select}
              disabled={isLoading || success}
            >
              <option value="student">นักเรียน</option>
              <option value="teacher">ครู</option>
            </select> */}
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