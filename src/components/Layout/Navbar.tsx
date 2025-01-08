import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { publicKey } = useWallet();

  return (
    <nav>
      <div>
        <Link to="/">Home</Link>
        {publicKey && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
      </div>
      <WalletMultiButton />
    </nav>
  );
};