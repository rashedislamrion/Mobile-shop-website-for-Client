import { ReactNode } from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MockAuthProvider } from '@/context/MockAuthContext';

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <MockAuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
        <Footer />
      </div>
    </MockAuthProvider>
  );
}
