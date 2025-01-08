import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import '@solana/wallet-adapter-react-ui/styles.css';

import { AppRoutes } from './routes';

export const App = () => {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};