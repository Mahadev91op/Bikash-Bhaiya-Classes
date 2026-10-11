import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('The platform is currently undergoing scheduled maintenance. Please check back shortly.');
  const router = useRouter();
  const segments = useSegments();

  // Listen for Maintenance Mode
  useEffect(() => {
    let unsubMaint: any = null;
    try {
      unsubMaint = onSnapshot(doc(db, 'settings', 'systemConfig'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIsMaintenance(Boolean(data?.maintenanceMode));
          if (data?.maintenanceMessage) {
            setMaintenanceMsg(data.maintenanceMessage);
          }
        } else {
          setIsMaintenance(false);
        }
      });
    } catch (err) {
      console.warn('Mobile maintenance listener error:', err);
    }

    return () => {
      if (unsubMaint) unsubMaint();
    };
  }, []);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: any = null;
    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      AsyncStorage.getItem('deviceId').then(deviceId => {
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          const data = docSnap.data();
          if (data && data.activeDeviceId && data.activeDeviceId !== deviceId) {
            Alert.alert("Session Expired", "You have been logged out because your account was accessed from another device.");
            auth.signOut();
          }
        });
      });
    }

    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    }

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [user, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Maintenance screen for students
  if (isMaintenance) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
          <Text style={{ fontSize: 38, color: '#ffffff', fontWeight: '900' }}>B</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 6, textAlign: 'center' }}>
          App Under Maintenance
        </Text>
        <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: '#fde68a', marginBottom: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            ⚡ Upgrades In Progress
          </Text>
        </View>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#e2e8f0', width: '100%', marginBottom: 24, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Notice From Administration
          </Text>
          <Text style={{ color: '#1e293b', fontSize: 14, lineHeight: 22, fontWeight: '600', textAlign: 'left' }}>
            {maintenanceMsg}
          </Text>
        </View>
        <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginBottom: 26, fontWeight: '500' }}>
          All your course enrollments & data are safe. The app will automatically resume once updates finish.
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('System Status', 'Re-checking system connection...');
          }}
          style={{ backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 14 }}>
            Check Status Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}