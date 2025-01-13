import React, { PropsWithChildren } from 'react';
import { Navbar } from './Navbar';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main style={{ marginTop: '80px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 