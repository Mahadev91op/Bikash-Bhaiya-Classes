'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<{
    isActive: boolean;
    message: string;
  }>({
    isActive: false,
    message: 'The platform is currently undergoing scheduled maintenance. Please check back shortly.'
  });
  const [checking, setChecking] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'systemConfig'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setMaintenance({
            isActive: Boolean(data?.maintenanceMode),
            message: data?.maintenanceMessage || 'We are performing scheduled maintenance to upgrade system performance. We will be back online shortly!'
          });
        } else {
          setMaintenance({ isActive: false, message: '' });
        }
        setChecking(false);
      }, (err) => {
        console.warn('Maintenance listener fallback:', err);
        setChecking(false);
      });

      return () => unsub();
    } catch (e) {
      setChecking(false);
    }
  }, []);

  const handleCheckStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  if (maintenance.isActive) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-100/90 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto selection:bg-blue-600 selection:text-white">
        {/* Soft, beautiful ambient gradients matching brand theme */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-300/10 rounded-full blur-[160px] pointer-events-none"></div>

        {/* Maintenance Container Card */}
        <div className="relative w-full max-w-lg bg-white/95 border-2 border-slate-200/90 rounded-[2.5rem] p-8 sm:p-11 shadow-2xl shadow-blue-900/10 text-center backdrop-blur-2xl">
          
          {/* Animated Hero Badge */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[3px] shadow-xl shadow-blue-500/25">
              <div className="w-full h-full bg-white rounded-[21px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50/60 pointer-events-none"></div>
                <svg 
                  className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin" 
                  style={{ animationDuration: '12s' }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            {/* Live Indicator Beacon */}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500 border-2 border-white items-center justify-center text-[10px] text-white font-black shadow-md">!</span>
            </span>
          </div>

          {/* Institute Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs mb-3 shadow-sm">
            <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center">B</span>
            <span>Bikash Bhaiya Classes</span>
            <span className="text-blue-300">•</span>
            <span className="text-[11px] text-blue-600/80">Learning Portal</span>
          </div>

          {/* Main Title & Status Badge */}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Platform Under Scheduled Maintenance
          </h2>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>System Upgrades In Progress</span>
          </div>

          {/* Dynamic Notice Box */}
          <div className="bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-6 text-left shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Message from Administration</span>
            </div>
            <p className="text-slate-800 font-semibold text-sm leading-relaxed">
              {maintenance.message}
            </p>
          </div>

          {/* Reassurance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">100% Data Safe</p>
                <p className="text-[11px] text-emerald-800/80 leading-snug">All lectures, tests & enrollments are protected.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950">Auto-Resume</p>
                <p className="text-[11px] text-blue-800/80 leading-snug">This page automatically re-enables when complete.</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={handleCheckStatus}
              disabled={isRefreshing}
              className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-black rounded-xl shadow-lg shadow-blue-600/25 text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isRefreshing ? 'Checking System Status...' : 'Check Status Again'}</span>
            </button>
          </div>

          <div className="pt-5 border-t border-slate-200 text-xs text-slate-500 font-medium">
            For urgent student assistance, contact Bikash Bhaiya Classes Academic Support.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
