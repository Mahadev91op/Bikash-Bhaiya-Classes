'use client';

import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClassroomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Loading classroom...</p></div>;
  }

  if (!user) return null;

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (auth.currentUser) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        // Await the update so permission is not denied
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          activeDeviceId: null,
          activeDeviceName: null
        });
      }
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Leave?</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out of your Bikash Bhaiya Classes account?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  disabled={isLoggingOut}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout} 
                  disabled={isLoggingOut}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition active:scale-95 disabled:opacity-50 flex justify-center items-center"
                >
                  {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Bikash Bhaiya Classes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">{user?.email}</span>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">Welcome to your Classroom!</h2>
          <p className="text-blue-100 max-w-2xl text-lg">
            Start learning today. Access your enrolled courses, live sessions, and study materials below.
          </p>
        </div>

        {/* Course Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">My Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Dummy Course Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer group">
              <div className="h-48 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=600&auto=format&fit=crop" alt="Physics" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
              </div>
              <div className="p-5">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider mb-3 inline-block">Physics</span>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Class 12th Physics Mastery</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">Complete physics curriculum for board exams with live doubt solving sessions.</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div className="bg-blue-600 h-2 rounded-full w-[45%]"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-700">45%</span>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center h-full min-h-[320px]">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Explore More Courses</h4>
              <p className="text-sm text-gray-500">Discover new subjects and enhance your skills.</p>
            </div>
            
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Notice Board
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-blue-600 font-bold">New</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Live Class Tomorrow!</h4>
                <p className="text-gray-600 text-sm mt-1">Physics Chapter 4 live session will start at 10:00 AM tomorrow. Don't miss it!</p>
                <span className="text-xs text-gray-400 mt-2 block">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
