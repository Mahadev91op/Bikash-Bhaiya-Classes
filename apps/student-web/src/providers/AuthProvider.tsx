'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export interface StudentProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  className?: string;
  schoolName?: string;
  role?: string;
  status?: string;
  enrolledCourses?: string[];
  activeDeviceId?: string;
  activeDeviceName?: string;
  createdAt?: any;
  streak?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  student: StudentProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  student: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          activeDeviceId: null,
          activeDeviceName: null,
        });
      }
    } catch (e) {
      console.warn('Error clearing device session on logout:', e);
    }
    await signOut(auth);
    setUser(null);
    setStudent(null);
    router.push('/login');
  };

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Subscribe to real-time student document in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setStudent({ id: docSnap.id, ...data });

            // Device concurrency check
            const myDeviceId = typeof window !== 'undefined' ? localStorage.getItem('deviceId') : null;
            if (data.activeDeviceId && myDeviceId && data.activeDeviceId !== myDeviceId) {
              alert('Session terminated: Your account was logged in from another device.');
              signOut(auth);
              setUser(null);
              setStudent(null);
              router.push('/login');
            }
          } else {
            setStudent({ id: currentUser.uid, email: currentUser.email || '' });
          }
          setLoading(false);
        }, (err) => {
          console.error('Error listening to student profile:', err);
          setLoading(false);
        });

        // If on login page while already authenticated, take to home
        if (pathname === '/login') {
          router.push('/');
        }
      } else {
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setStudent(null);
        setLoading(false);

        // Protected routes check
        const isPublic = pathname === '/login' || pathname.startsWith('/courses');
        if (!isPublic) {
          router.push('/login');
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, student, loading, logout }}>
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
          <div className="flex flex-col items-center gap-3">
            <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Bikash Bhaiya Classes</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div style={{ display: loading ? 'none' : 'block' }}>
        {children}
      </div>
    </AuthContext.Provider>
  );
}
