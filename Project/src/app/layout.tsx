import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useSettingsStore } from '@/features/settings/store';
import { useEffect } from 'react';

export default function Layout() {
  const { theme } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (theme.mode === 'dark' || 
        (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply reduced motion preference
    if (theme.reducedMotion) {
      root.style.setProperty('--motion-reduce', '1');
    } else {
      root.style.removeProperty('--motion-reduce');
    }
  }, [theme]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}