'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-500 font-medium">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-gray-50 hover:shadow transition-all active:scale-95">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span>Refresh Data</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition-shadow relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">₹</span>
            </div>
            <div className="bg-gray-100 px-2.5 py-1 rounded-md">
              <span className="text-gray-600 font-bold text-xs">↑ 12.5%</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">₹1,72,769</h2>
          <p className="text-gray-500 font-medium text-sm">Total Revenue</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Lifetime earnings</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition-shadow relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div className="bg-gray-100 px-2.5 py-1 rounded-md">
              <span className="text-gray-600 font-bold text-xs">↑ 12.5%</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">186</h2>
          <p className="text-gray-500 font-medium text-sm">Total Students</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Registered users</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition-shadow relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <div className="bg-gray-100 px-2.5 py-1 rounded-md">
              <span className="text-gray-600 font-bold text-xs">↑ 12.5%</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">12</h2>
          <p className="text-gray-500 font-medium text-sm">Total Courses</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Active curriculum</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition-shadow relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div className="bg-gray-100 px-2.5 py-1 rounded-md">
              <span className="text-gray-600 font-bold text-xs">↓ 0.0%</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">0</h2>
          <p className="text-gray-500 font-medium text-sm">Pending Requests</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Action required</p>
          </div>
        </div>

      </div>

      {/* Enrollment Requests Section */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Enrollment Requests</h2>
          </div>
          <div className="bg-gray-200 px-4 py-1.5 rounded-full">
            <span className="text-gray-700 font-bold text-sm">0 Pending</span>
          </div>
        </div>

        <div className="w-full bg-white border border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center shadow-md relative z-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-200">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
          <p className="text-gray-500 font-medium">There are no pending enrollment requests right now.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
