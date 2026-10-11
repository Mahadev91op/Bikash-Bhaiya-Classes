'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  Home,
  GraduationCap,
  BookOpen,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, student, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll state for smooth auto-hide on scroll down and reveal on scroll up
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80) {
        if (currentScrollY > lastScrollY && !mobileMenuOpen) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  // Listen to unread notifications for logged-in student
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
    { label: 'Home', href: '/', icon: Home },
    { label: 'Courses', href: '/courses', icon: GraduationCap },
    { label: 'My Learning', href: '/classroom', icon: BookOpen },
    { label: 'Alerts', href: '/alerts', icon: Bell, badge: unreadAlerts },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Premium Apple-Style Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center border border-slate-200/80 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
              <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Sign Out of Account?</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
              Are you sure you want to log out of Bikash Bhaiya Classes? You will need to log in again to access your live classes.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition active:scale-95 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition active:scale-95 text-xs flex items-center justify-center shadow-sm shadow-red-500/20"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Apple / PW-Style Floating Header */}
      <header
        className={`sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/70 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Crisp Logo & Branding */}
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm shadow-blue-500/15 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center">
                  <img
                    src="/icon.png"
                    alt="Bikash Bhaiya Classes"
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-black text-blue-600 text-base">B</span>
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-slate-900 text-[15px] tracking-tight group-hover:text-blue-600 transition-colors">
                  Bikash Bhaiya Classes
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">
                  Rato nahi... Samjho...
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-extrabold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action / Profile Area */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Clean Student Profile Badge */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl hover:bg-slate-100/80 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1 transition-colors">
                        {student?.name || 'Student'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {student?.className ? `Class ${student.className}` : 'WB Board'}
                      </span>
                    </div>
                  </Link>

                  {/* Sleek Logout Button */}
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>
            </div>

          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-200/80 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {navLinks.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 stroke-[2.2]" />
                      <span>{item.label}</span>
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Sign Out of Account</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
