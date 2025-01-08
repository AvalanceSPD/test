import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../utils/supabaseClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { publicKey, disconnect } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async () => {
    if (!publicKey) return;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', publicKey.toString())
      .single();

    if (existingUser) {
      setUser(existingUser);
    }
  };

  const signOut = async () => {
    await disconnect();
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (publicKey) {
        await signIn();
      }
      setLoading(false);
    };
    checkAuth();
  }, [publicKey, signIn]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
