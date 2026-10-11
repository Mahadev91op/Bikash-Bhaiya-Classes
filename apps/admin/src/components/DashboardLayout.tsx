import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100 font-sans selection:bg-blue-200 relative overflow-hidden z-0">
      {/* Premium subtle background glow to make it less plain white */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 sm:py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
