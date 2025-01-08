import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { CourseDetail } from './components/Course/CourseDetail';
import { CreateCourse } from './components/Course/CreateCourse';

// นำเข้า Default styles
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  // เลือก Network เป็น Testnet
  const network = WalletAdapterNetwork.Testnet;

  // สร้าง endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // สร้าง wallets array
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/create-course" element={<CreateCourse />} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;