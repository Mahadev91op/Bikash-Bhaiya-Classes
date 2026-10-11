'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// Module-level cache: persists across Next.js client-side navigations in single page session!
let cachedSidebarCollapsed: boolean | null = null;

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  if (cachedSidebarCollapsed !== null) return cachedSidebarCollapsed;
  try {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    cachedSidebarCollapsed = saved === 'true';
    return cachedSidebarCollapsed;
  } catch {
    return false;
  }
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize synchronously with cached state to prevent any layout shift or opening-then-closing on route navigation
  const [collapsed, setCollapsed] = useState<boolean>(getInitialSidebarCollapsed);
  const [isManualToggling, setIsManualToggling] = useState<boolean>(false);
  const toggleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync with localStorage on initial mount
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed') === 'true';
      if (saved !== collapsed) {
        cachedSidebarCollapsed = saved;
        setCollapsed(saved);
      }
    } catch {}

    return () => {
      if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
    };
  }, []);

  const toggleSidebar = () => {
    // Only enable width transition during manual user click
    setIsManualToggling(true);
    const nextState = !collapsed;
    cachedSidebarCollapsed = nextState;
    setCollapsed(nextState);

    try {
      localStorage.setItem('admin_sidebar_collapsed', String(nextState));
    } catch {}

    if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
    toggleTimerRef.current = setTimeout(() => {
      setIsManualToggling(false);
    }, 320);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return pathname === path;
  };

  const navItems = [
    {
      title: 'Overview',
      path: '/',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      title: 'Courses',
      path: '/courses',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: 'Students',
      path: '/students',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Classroom',
      path: '/classroom',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white flex flex-col relative overflow-hidden shadow-2xl shrink-0 h-screen border-r border-white/10 z-30 select-none ${
        isManualToggling ? 'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-white rounded-full mix-blend-overlay opacity-10 blur-xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-white rounded-full mix-blend-overlay opacity-10 blur-xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="p-4 pt-6 relative z-10 flex items-center justify-between min-h-[76px]">
        <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center shrink-0 border-2 border-white/20">
            <span className="text-blue-600 font-black text-xl">B</span>
          </div>
          
          <div 
            className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
              collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[150px] opacity-100'
            }`}
          >
            <h1 className="text-base font-extrabold tracking-wide text-white leading-tight">Bikash Bhaiya</h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[9px] font-extrabold tracking-widest uppercase bg-white/20 px-1.5 py-0.5 rounded text-blue-50 border border-white/20">
                Admin
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button (When expanded) */}
        {!collapsed && (
          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/20 active:scale-95 transition-all shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expand Toggle Button (When collapsed, sleek and centered) */}
      {collapsed && (
        <div className="px-3 pt-1 pb-1 flex justify-center relative z-10">
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            className="w-11 h-8 flex items-center justify-center rounded-lg text-blue-100 hover:text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 px-3 py-4 space-y-1.5 relative z-10 overflow-y-auto overflow-x-hidden ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative flex items-center rounded-xl font-medium select-none ${
                collapsed
                  ? 'w-11 h-11 justify-center'
                  : 'w-full px-3.5 py-3 space-x-3.5'
              } ${
                active
                  ? 'bg-white/20 text-white font-bold border border-white/30 shadow-md backdrop-blur-md'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-200 shrink-0 ${active ? 'scale-110 text-white' : 'group-hover:scale-110 opacity-90'}`}>
                {item.icon}
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
                  collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[140px] opacity-100'
                }`}
              >
                <span className="text-sm tracking-wide">
                  {item.title}
                </span>
              </div>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap z-50 transition-opacity duration-150 border border-slate-700">
                  {item.title}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-slate-900"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 relative z-10 border-t border-white/10 mt-auto min-h-[64px]">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={collapsed ? 'Logout' : undefined}
          className={`group relative flex items-center rounded-xl font-medium disabled:opacity-50 text-blue-100 hover:bg-rose-500/20 hover:text-white select-none ${
            collapsed
              ? 'w-11 h-11 justify-center mx-auto'
              : 'w-full px-3.5 py-3 space-x-3'
          }`}
        >
          <svg className="w-5 h-5 shrink-0 opacity-80 group-hover:text-rose-200 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          
          <div
            className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
              collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[140px] opacity-100'
            }`}
          >
            <span className="text-sm font-semibold">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </div>

          {collapsed && (
            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-rose-950 text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap z-50 transition-opacity duration-150 border border-rose-800">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-rose-950"></div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
