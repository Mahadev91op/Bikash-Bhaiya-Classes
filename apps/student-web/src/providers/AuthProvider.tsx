'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        if (!pathname.startsWith('/login')) {
          const myDeviceId = localStorage.getItem('deviceId');
          unsubscribeSnapshot = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            const data = docSnap.data();
            if (data && data.activeDeviceId && data.activeDeviceId !== myDeviceId) {
              alert("You have been logged out because your account was accessed from another device.");
              auth.signOut();
            }
          });
        }
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        if (!pathname.startsWith('/login')) {
          router.push('/login');
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid #ccc', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div style={{ display: loading ? 'none' : 'block' }}>
        {children}
      </div>
    </AuthContext.Provider>
  );
}
