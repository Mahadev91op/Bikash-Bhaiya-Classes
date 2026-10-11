import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../src/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function MobileProfileScreen() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((snap) => {
        if (snap.exists()) setStudent(snap.data());
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          activeDeviceId: null,
          activeDeviceName: null,
        });
      }
      await signOut(auth);
      router.replace('/(auth)');
    } catch (error) {
      console.warn('Logout error:', error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const studentName = student?.name || auth.currentUser?.email?.split('@')[0] || 'Student';
  const studentInitial = studentName.charAt(0).toUpperCase();
  const enrolledCount = student?.enrolledCourses?.length || 1;

  return (
    <View style={styles.container}>
      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isLoggingOut && setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>Ready to Leave?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to log out of your Bikash Bhaiya Classes account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={confirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Yes, Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card (Matching Design Screenshot 5) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{studentInitial}</Text>
          </View>

          <Text style={styles.profileName}>{studentName}</Text>
          <Text style={styles.profileContact}>
            {auth.currentUser?.email} • {student?.phone ? `+91 ${student.phone}` : 'No phone linked'}
          </Text>

          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>
              🎓 Class {student?.className || '12'} • WBCHSE • Batch 2024-26
            </Text>
          </View>
        </View>

        {/* 3 Stat Cards in a row (Matching Design Screenshot 5) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={{ fontSize: 20 }}>🔥</Text>
            <Text style={styles.statNumber}>{student?.streak || 5} Days</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={{ fontSize: 20 }}>📚</Text>
            <Text style={styles.statNumber}>{enrolledCount}</Text>
            <Text style={styles.statLabel}>Active Courses</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={{ fontSize: 20 }}>🎖</Text>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Certificate</Text>
          </View>
        </View>

        {/* Academic & Progress Section (Matching Design Screenshot 5) */}
        <Text style={styles.sectionHeader}>ACADEMIC & PROGRESS</Text>
        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: '#eff6ff' }]}>
              <Text style={{ fontSize: 16 }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Academic Details</Text>
              <Text style={styles.menuSub}>Stream, Target Exams & Goals</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: '#eff6ff' }]}>
              <Text style={{ fontSize: 16 }}>📱</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Device Security</Text>
              <Text style={styles.menuSub}>Single device active ({student?.activeDeviceName || 'Mobile'})</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>

        {/* Preferences & Support (Matching Design Screenshot 5) */}
        <Text style={styles.sectionHeader}>PREFERENCES & SUPPORT</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://wa.me/916290325241?text=Hello%20Bikash%20Bhaiya%2C%20I%20need%20support')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#ecfdf5' }]}>
              <Text style={{ fontSize: 16 }}>💬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Help & Support</Text>
              <Text style={styles.menuSub}>Contact Bikash Bhaiya Classes (+91 6290325241)</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://www.youtube.com/@wbartsbyvikassir')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#fee2e2' }]}>
              <Text style={{ fontSize: 16 }}>📺</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Official YouTube Channel</Text>
              <Text style={styles.menuSub}>WB Arts & Commerce by Vikas Sir</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button (Matching Design Screenshot 5) */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 Log Out of Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  scrollContent: { padding: 18, paddingBottom: 40 },

  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  profileName: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  profileContact: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 10 },
  classBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#dbeafe' },
  classBadgeText: { color: '#2563eb', fontSize: 11, fontWeight: '800' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: '700' },

  sectionHeader: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  menuGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  menuSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  chevron: { fontSize: 18, color: '#cbd5e1', fontWeight: '900' },

  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 6,
  },
  logoutBtnText: { color: '#dc2626', fontSize: 13, fontWeight: '900' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: { width: 60, height: 60, backgroundColor: '#fee2e2', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  modalSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#f1f5f9' },
  modalBtnCancelText: { color: '#475569', fontWeight: '800', fontSize: 13 },
  modalBtnConfirm: { backgroundColor: '#ef4444' },
  modalBtnConfirmText: { color: '#fff', fontWeight: '900', fontSize: 13 },
});
