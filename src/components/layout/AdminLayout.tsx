import { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Sidebar />
    </div>
  );
};