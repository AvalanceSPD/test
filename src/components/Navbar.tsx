import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };

  const handleLogout = () => {
    // ฟังก์ชันสำหรับ logout
    console.log("Logout");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">MyApp</Link>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/lessons">บทเรียน</Link>
        </li>
        <li>
          <Link to="/courses">หลักสูตร</Link>
        </li>
        <li>
          <Link to="/about">เกี่ยวกับเรา</Link>
        </li>
        <li>
          <Link to="/contact">ติดต่อเรา</Link>
        </li>
        <li className={styles.profile}>
          <FaUserCircle onClick={toggleDropdown} className={styles.profileIcon} />
          <div className={`${styles.dropdown} ${dropdownOpen ? styles.show : ''}`}>
            <Link to="/profile" className={styles.dropdownItem}>โปรไฟล์</Link>
            <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 