import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  hPadding?: boolean;
}

export function MainLayout({ children, hPadding = true }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className={cn(
          "flex-1 overflow-y-auto bg-muted/30",
          hPadding ? "p-6" : "p-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
