import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../utils/supabaseClient';

export const useUser = () => {
  const { publicKey } = useWallet();
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (publicKey) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .single();

        if (user) {
          setUserRole(user.role);
          setUserId(user.id);
        }
      }
    };

    fetchUser();
  }, [publicKey]);

  return { userRole, userId };
}; 