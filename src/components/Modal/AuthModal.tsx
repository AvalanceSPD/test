import React from 'react';
import styles from './Modal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AuthModal = ({ isOpen, onClose, children }: AuthModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}; 