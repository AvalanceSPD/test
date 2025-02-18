import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { supabase } from "../../utils/supabaseClient";
import styles from "./ModalAuth.module.css";
import bs58 from "bs58";
import { sign } from "tweetnacl";

interface RegisterModalProps {
  onLoginClick: () => void;
  onRegisterSuccess: (redirectPath: string) => Promise<void>;
}

export const RegisterModal = ({
  onLoginClick,
  onRegisterSuccess,
}: RegisterModalProps) => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!publicKey || !username || !role) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const message = `ยืนยันการลงทะเบียนบัญชี ${username.trim()}`;
      const encodedMessage = new TextEncoder().encode(message);

      // ขอลายเซ็นจากผู้ใช้
      let signature: Uint8Array;
      try {
        // แก้ไขกรับลายเซ็นและแปลงเป็น Uint8Array
        const signatureResponse = await (window as any).solana.signMessage(
          encodedMessage,
          "utf8"
        );
        signature = new Uint8Array(signatureResponse.signature);
      } catch (signError) {
        setError("กรุณายืนยันการลงทะเบียนด้วยการเซ็นข้อความ");
        return;
      }

      // ตรวจสอบลายเซ็น
      const verified = sign.detached.verify(
        encodedMessage,
        signature,
        publicKey.toBytes()
      );

      if (!verified) {
        setError("การยืนยันตัวตนล้มเหลว");
        return;
      }

      const { data: existingWallet, error: walletError } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("wallet_address", publicKey.toString())
        .maybeSingle();

      if (walletError) {
        console.error("Error checking wallet:", walletError);
        setError(
          `เกิดข้อผิดพลาดในการตรวจสอบกระเป๋าเงิน: ${walletError.message}`
        );
        return;
      }

      if (existingWallet) {
        setError("กระเป๋าเงินนี้ได้ลงทะเบียนไปแล้ว");
        return;
      }

      // ตรวจสอบ username
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.trim())
        .maybeSingle();

      if (checkError) {
        console.error("Error checking username:", checkError);
        setError(`เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้: ${checkError.message}`);
        return;
      }

      if (existingUser) {
        setError("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
        return;
      }

      //: เพิ่มช้อมูลนักเรียนใหม่่
      const { data:rpcdata, error:rpcerror } = await supabase
        .rpc('create_std', {
          p_std_name:fullname,
          p_signature:bs58.encode(signature), 
          p_username:username.trim(), 
          p_wallet_address:publicKey.toString()
        })
      if (rpcerror) {
        console.error(rpcerror)
        throw rpcerror;
      }
      else console.log(rpcdata)

    setSuccess(true);
    setTimeout(() => {
      navigate('/home_1');
    }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      setError("เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1>ลงทะเบียนผู้ใช้ใหม่</h1>
      <div className={styles.buttonContainer}>
        <WalletMultiButton className={styles.walletButton} />
        {publicKey && (
          <>
            {error && <div className={styles.errorMessage}>{error}</div>}
              {success && (
                <div className={styles.successMessage}>
                  ลงทะเบียนสำเร็จ! กำลังกลับไปยังหน้าเข้าสู่ระบบ...
                </div>
            )}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Full name"
              className={styles.input}
              minLength={3}
              maxLength={30}
            />
            <button
              onClick={handleRegister}
              disabled={isLoading || success || !username.trim()}
              className={styles.registerButton}
            >
              {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
