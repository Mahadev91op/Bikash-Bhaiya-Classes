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
      {!loading && children}
    </AuthContext.Provider>
  );
}
