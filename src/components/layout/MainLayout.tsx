'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <LoadingProvider>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
            <NotificationCenter />
          </div>
        </LoadingProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
