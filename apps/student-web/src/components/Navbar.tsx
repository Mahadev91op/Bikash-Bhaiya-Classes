'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, student, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen to unread notifications for logged in student
  useEffect(() => {
    if (!user) {
      setUnreadAlerts(0);
      return;
    }

    try {
      const notifsRef = collection(db, 'users', user.uid, 'notifications');
      const q = query(notifsRef, where('read', '==', false));
      const unsub = onSnapshot(q, (snap) => {
        setUnreadAlerts(snap.size);
      }, (err) => {
        console.warn('Notifications listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up notifications listener:', e);
    }
  }, [user]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
  };

  const navLinks = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Courses', href: '/courses', icon: '🎓' },
    { label: 'My Learning', href: '/classroom', icon: '📖' },
    { label: 'Alerts', href: '/alerts', icon: '🔔', badge: unreadAlerts },
    { label: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center border-2 border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Ready to Leave?</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              Are you sure you want to log out of your Bikash Bhaiya Classes account?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition active:scale-95 text-sm flex items-center justify-center"
              >
                {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Institute Branding */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden border border-blue-400">
                <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }} />
                <span className="text-white font-black text-2xl">B</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                    Bikash Bhaiya Classes
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-200">
                    Live Portal
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 italic">
                  Rato nahi... Samjho...
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center shadow-sm animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action / Profile Area */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Streak Card */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-black text-xs shadow-xs">
                    <span className="text-sm">🔥</span>
                    <span>{student?.streak || 5} Days Streak</span>
                  </div>

                  {/* Student Profile Chip */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 line-clamp-1">
                        {student?.name || 'Student'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {student?.className ? `Class ${student.className}` : 'WB Board'}
                      </span>
                    </div>
                  </Link>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    title="Log Out"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
                >
                  Student Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-200 space-y-1 animate-fade-in">
              {navLinks.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <span>🚪</span>
                  <span>Log Out of Account</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
