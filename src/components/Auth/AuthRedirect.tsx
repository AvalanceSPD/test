import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

export const AuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ถ้ามี state from ให้ redirect ไปที่หน้านั้น
        const from = location.state?.from || '/';
        navigate(from);
      }
    };

    checkAuth();
  }, [navigate, location]);

  return null;
}; 