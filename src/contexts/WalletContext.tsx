import React, { PropsWithChildren } from 'react';
import { WalletProvider as SolanaWalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export const useWallet = useSolanaWallet;

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <SolanaWalletProvider wallets={[]} autoConnect>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </SolanaWalletProvider>
  );
};