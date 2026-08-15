import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { AdminPageProvider } from '@/contexts/AdminPageContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminPageProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Desktop Sidebar (Responsive logic inside component) */}
        <div className="hidden lg:block h-full">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminPageProvider>
  );
}
