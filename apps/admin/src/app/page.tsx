'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-indigo-300 text-sm mt-1">Bikash Bhaiya Classes</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="block p-3 bg-indigo-800 rounded-lg text-white font-medium">
            Dashboard
          </Link>
          <Link href="/students" className="block p-3 text-indigo-200 hover:bg-indigo-800 hover:text-white rounded-lg transition">
            Students
          </Link>
          <Link href="/courses" className="block p-3 text-indigo-200 hover:bg-indigo-800 hover:text-white rounded-lg transition">
            Courses
          </Link>
          <Link href="/notices" className="block p-3 text-indigo-200 hover:bg-indigo-800 hover:text-white rounded-lg transition">
            Notices & Alerts
          </Link>
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            {isLoggingOut ? 'Locking...' : 'Logout & Lock'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Admin User</span>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              A
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Total Students</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">1,248</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Active Courses</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹45,000</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Recent Registrations</h3>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View All</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Class</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-50">
                  <td className="py-4">Demo Student</td>
                  <td className="py-4">demo.student@example.com</td>
                  <td className="py-4">12th</td>
                  <td className="py-4 text-gray-500">Just now</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
