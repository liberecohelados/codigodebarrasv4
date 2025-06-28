import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-start justify-center p-6">
    <div className="w-full max-w-lg bg-white shadow-xl shadow-neutral-200/50 rounded-2xl p-8">
      {children}
    </div>
  </div>
);

export default Layout;