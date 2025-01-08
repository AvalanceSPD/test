import React, { PropsWithChildren } from 'react';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="app-layout">
      {/* Add header, navigation, etc. here if needed */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout; 