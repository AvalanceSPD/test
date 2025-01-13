import { Register } from './Register';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return <Register onLoginClick={handleLoginClick} />;
}; 