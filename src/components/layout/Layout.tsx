
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header title={title} />
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
