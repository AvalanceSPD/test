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
    if (!publicKey || !username || !fullname) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const message = `Confirm registration for account ${username.trim()}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Request signature from user
      let signature: Uint8Array;
      try {
        const signatureResponse = await (window as any).solana.signMessage(
          encodedMessage,
          "utf8"
        );
        signature = new Uint8Array(signatureResponse.signature);
      } catch (signError) {
        setError("Please confirm registration by signing the message");
        return;
      }

      // Verify signature
      const verified = sign.detached.verify(
        encodedMessage,
        signature,
        publicKey.toBytes()
      );

      if (!verified) {
        setError("Authentication failed");
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
          `Error checking wallet: ${walletError.message}`
        );
        return;
      }

      if (existingWallet) {
        setError("This wallet has already registered");
        return;
      }

      // Check username
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.trim())
        .maybeSingle();

      if (checkError) {
        console.error("Error checking username:", checkError);
        setError(`Error checking username: ${checkError.message}`);
        return;
      }

      if (existingUser) {
        setError("This username is already taken");
        return;
      }

      // Add new student information
      const { data: rpcdata, error: rpcerror } = await supabase
        .rpc('create_std', {
          p_std_name: fullname,
          p_signature: bs58.encode(signature), 
          p_username: username.trim(), 
          p_wallet_address: publicKey.toString()
        });
      if (rpcerror) {
        console.error(rpcerror);
        throw rpcerror;
      }

      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess('/student-profile');
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1>Register New Student</h1>
      <div className={styles.buttonContainer}>
        <WalletMultiButton className={styles.walletButton} />
        {publicKey && (
          <>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && (
              <div className={styles.successMessage}>
                Registration successful! Redirecting to login page...
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
              placeholder="Full Name"
              className={styles.input}
              minLength={3}
              maxLength={30}
            />
            <button
              onClick={handleRegister}
              disabled={isLoading || success || !username.trim()}
              className={styles.registerButton}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
