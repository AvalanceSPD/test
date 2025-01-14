import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthModal } from '../Modal/AuthModal';
import { LoginModal } from '../Modal/LoginModal';
import { RegisterModal } from '../Modal/RegisterModal';
import styles from './Navbar.module.css';
import { supabase } from '../../utils/supabaseClient';

export const Navbar = () => {
  const { publicKey, disconnect } = useWallet();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // เพิ่มฟังก์ชันเช็คการลงทะเบียน
  useEffect(() => {
    const checkUser = async () => {
      if (publicKey) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('wallet_address', publicKey.toString())
            .single();
          
          if (error) {
            setIsRegistered(false);
            setUserRole(null);
          } else {
            setIsRegistered(true);
            setUserRole(data.role);
          }
        } catch (error) {
          setIsRegistered(false);
          setUserRole(null);
        }
      } else {
        setIsRegistered(null);
        setUserRole(null);
      }
    };

    checkUser();
  }, [publicKey]);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDropdown(false);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 0);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleLoginSuccess = async (redirectPath: string) => {
    return new Promise<void>((resolve) => {
      setShowLogin(false);
      setShowRegister(false);
      
      requestAnimationFrame(() => {
        navigate(redirectPath);
        resolve();
      });
    });
  };

  const handleCloseModal = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleRegisterClick = () => {
    setShowDropdown(false);
    setShowRegister(true);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    switch (userRole) {
      case 'student':
        navigate('/student-profile');
        break;
      case 'teacher':
        navigate('/teacher-profile');
        break;
      default:
        navigate('/profile');
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className={styles.logo}
            />
          </Link>

          {userRole === 'teacher' && (
            <button 
              onClick={() => navigate('/create-lesson')}
              className={styles.navButton}
            >
              สร้างบทเรียน
            </button>
          )}

          {userRole === 'student' && (
            <div className={styles.studentNav}>
              <button 
                onClick={() => navigate('/')}
                className={styles.navButton}
              >
                หน้าแรก
              </button>
              <button 
                onClick={() => navigate('/all-lessons')}
                className={styles.navButton}
              >
                บทเรียนทั้งหมด
              </button>
            </div>
          )}
        </div>

        <div className={styles.rightSection}>
          {publicKey ? (
            <div className={styles.profileContainer} ref={dropdownRef}>
              <img 
                src="/default_profile.png"
                alt="Profile"
                className={styles.profileImage}
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className={styles.dropdown}>
                  {isRegistered && (
                    <button 
                      onClick={handleProfileClick}
                      className={`${styles.dropdownItem} ${styles.profileItem}`}
                    >
                      โปรไฟล์
                    </button>
                  )}
                  {!isRegistered && (
                    <button 
                      onClick={handleRegisterClick}
                      className={`${styles.dropdownItem} ${styles.registerItem}`}
                    >
                      ลงทะเบียนผู้ใช้
                    </button>
                  )}
                  <button 
                    onClick={handleDisconnect}
                    className={styles.dropdownItem}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleLoginClick}
              className={styles.loginButton}
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={showLogin} 
        onClose={handleCloseModal}
      >
        <LoginModal 
          onRegisterClick={switchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      </AuthModal>

      <AuthModal 
        isOpen={showRegister} 
        onClose={handleCloseModal}
      >
        <RegisterModal 
          onLoginClick={switchToLogin}
          onRegisterSuccess={handleLoginSuccess}
        />
      </AuthModal>
    </>
  );
};