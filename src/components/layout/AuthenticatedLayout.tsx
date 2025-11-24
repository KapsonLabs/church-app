import React from 'react';
import { cn } from '@/lib/utils';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthenticatedLayout({ children, className }: AuthenticatedLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex h-full">
        {/* Sidebar - Fixed on md+ screens only */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 md:border-r md:border-gray-200 dark:md:border-gray-700 overflow-hidden">
          <Sidebar />
        </aside>
        
        {/* Main content area - Takes remaining space */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Navbar - Fixed at top */}
          <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <Navbar />
          </header>
          
          {/* Main content - Scrollable area */}
          <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900",
            className
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
