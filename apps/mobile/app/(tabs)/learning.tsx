import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../src/lib/firebase';
import { collection, query, getDocs, doc, getDoc, limit } from 'firebase/firestore';

export default function MobileLearningScreen() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'classroom' | 'lectures' | 'notes'>('classroom');

  const loadData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const uSnap = await getDoc(doc(db, 'users', currentUser.uid));
      const uData = uSnap.data() || {};
      const enrolledIds: string[] = uData.enrolledCourses || [];

      const coursesSnap = await getDocs(collection(db, 'courses'));
      const allCourses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const myCourses: any[] = [];
      for (const c of allCourses) {
        if (enrolledIds.includes(c.id)) {
          myCourses.push(c);
        } else {
          try {
            const sub = await getDoc(doc(db, 'courses', c.id, 'enrolledStudents', currentUser.uid));
            if (sub.exists()) myCourses.push(c);
          } catch (e) {}
        }
      }

      setEnrolledCourses(myCourses);
      if (myCourses.length > 0) {
        setSelectedCourse(myCourses[0]);
      }

      // Notifications
      try {
        const notifs = await getDocs(query(collection(db, 'users', currentUser.uid, 'notifications'), limit(5)));
        setNotifications(notifs.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {}

    } catch (err) {
      console.warn('Error loading learning data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>
              {selectedCourse?.title?.charAt(0) || 'B'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.courseHeaderTitle} numberOfLines={1}>
              {selectedCourse?.title || 'My Classroom'}
            </Text>
            <Text style={styles.teacherSub}>Taught by Bikash Chowdhury</Text>
          </View>
        </View>
      </View>

      {/* Sub-Pills Bar (Matching Design Screenshot 4) */}
      <View style={styles.subPillsBar}>
        {[
          { id: 'classroom', label: 'Classroom', icon: '📊' },
          { id: 'lectures', label: 'Lectures', icon: '▶' },
          { id: 'notes', label: 'Notes', icon: '📄' },
        ].map((item) => {
          const active = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.subPill, active && styles.subPillActive]}
              onPress={() => setActiveTab(item.id as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.subPillText, active && styles.subPillTextActive]}>
                {item.icon} {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
      >
        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginVertical: 40 }} />
        ) : enrolledCourses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={styles.emptyTitle}>Your Classroom is Empty</Text>
            <Text style={styles.emptySub}>
              You have not enrolled in any batch program yet. Browse available courses to start learning.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(tabs)/courses' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.browseBtnText}>Explore Courses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Overall Course Progress Card (Matching Design Screenshot 4) */}
            <View style={styles.overallProgressCard}>
              <View style={styles.overallProgressHeader}>
                <View>
                  <Text style={styles.overallLabel}>OVERALL COURSE PROGRESS</Text>
                  <Text style={styles.overallTitle}>42% Completed</Text>
                </View>
                <View style={styles.overallPercentCircle}>
                  <Text style={styles.overallPercentText}>42%</Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '42%' }]} />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Lectures</Text>
                  <Text style={styles.statValue}>18/42</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Tests</Text>
                  <Text style={styles.statValue}>4/10</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Notes</Text>
                  <Text style={styles.statValue}>12 Avail.</Text>
                </View>
              </View>
            </View>

            {/* Continue Learning Card (Matching Design Screenshot 4) */}
            <View style={styles.continueCard}>
              <View style={styles.continueTag}>
                <Text style={styles.continueTagText}>● Continue Learning</Text>
              </View>
              <Text style={styles.continueChapter}>Chapter 4: Quadratic Equations</Text>
              <Text style={styles.continueTopic}>Introduction to Quadratic Equations & Standard Form</Text>

              <View style={styles.chapterProgressRow}>
                <Text style={styles.chapterProgressLabel}>Chapter Progress</Text>
                <Text style={styles.chapterProgressValue}>68%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '68%' }]} />
              </View>

              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => Linking.openURL('https://www.youtube.com/@wbartsbyvikassir')}
                activeOpacity={0.8}
              >
                <Text style={styles.continueBtnText}>▶ Continue Learning</Text>
              </TouchableOpacity>
            </View>

            {/* Active Module Card (Matching Design Screenshot 4) */}
            <View style={styles.moduleCard}>
              <Text style={styles.moduleSubtitle}>Active Module</Text>
              <Text style={styles.moduleTitle}>Chapter 4 — Quadratic Equations</Text>
              <View style={styles.modulePillsRow}>
                <View style={styles.modulePill}><Text style={styles.modulePillText}>8 Lectures</Text></View>
                <View style={styles.modulePill}><Text style={styles.modulePillText}>3 Notes</Text></View>
                <View style={styles.modulePill}><Text style={styles.modulePillText}>1 Test</Text></View>
              </View>
            </View>

            {/* Upcoming & Alerts Section (Matching Design Screenshot 4) */}
            <Text style={styles.sectionTitle}>Upcoming & Alerts</Text>

            {/* Alert 1: Live Soon */}
            <View style={styles.alertCard}>
              <View style={[styles.alertIconBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 18 }}>📺</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTagRed}>LIVE SOON</Text>
                <Text style={styles.alertTitle}>Problem Solving Session</Text>
                <Text style={styles.alertSub}>Today at 6:00 PM • Bikash Chowdhury</Text>
              </View>
              <TouchableOpacity
                style={styles.alertActionBtn}
                onPress={() => Linking.openURL('https://www.youtube.com/@wbartsbyvikassir')}
                activeOpacity={0.8}
              >
                <Text style={styles.alertActionText}>Join</Text>
              </TouchableOpacity>
            </View>

            {/* Alert 2: Upcoming Test */}
            <View style={styles.alertCard}>
              <View style={[styles.alertIconBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={{ fontSize: 18 }}>📝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTagBlue}>UPCOMING TEST</Text>
                <Text style={styles.alertTitle}>Quadratic Equations Unit Test</Text>
                <Text style={styles.alertSub}>Tomorrow, 10:00 AM • 20 Questions</Text>
              </View>
              <TouchableOpacity style={styles.alertActionBtn} activeOpacity={0.8}>
                <Text style={styles.alertActionText}>Details</Text>
              </TouchableOpacity>
            </View>

            {/* Alert 3: New Notice from Firestore */}
            <View style={styles.alertCard}>
              <View style={[styles.alertIconBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={{ fontSize: 18 }}>📢</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTagGreen}>NEW NOTICE</Text>
                <Text style={styles.alertTitle}>
                  {notifications.length > 0 ? notifications[0].title : 'Formula Sheet Uploaded'}
                </Text>
                <Text style={styles.alertSub}>
                  {notifications.length > 0 ? notifications[0].message : 'Check the Notes section for Chapter 4 quick reference.'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.alertActionBtn}
                onPress={() => router.push('/(tabs)/alerts' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.alertActionText}>View</Text>
              </TouchableOpacity>
            </View>

          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseBadgeText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  courseHeaderTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  teacherSub: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  subPillsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  subPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  subPillActive: { backgroundColor: '#2563eb' },
  subPillText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  subPillTextActive: { color: '#ffffff' },

  scrollContent: { padding: 18, paddingBottom: 40 },

  // Overall Progress
  overallProgressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  overallProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  overallLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  overallTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  overallPercentCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallPercentText: { fontSize: 12, fontWeight: '900', color: '#2563eb' },
  progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginVertical: 10, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#2563eb', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  statValue: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginTop: 2 },

  // Continue Learning
  continueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  continueTag: { backgroundColor: '#ecfdf5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  continueTagText: { color: '#059669', fontSize: 10, fontWeight: '900' },
  continueChapter: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  continueTopic: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  chapterProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chapterProgressLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  chapterProgressValue: { fontSize: 11, color: '#2563eb', fontWeight: '900' },
  continueBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 14 },
  continueBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },

  // Active Module
  moduleCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 22,
  },
  moduleSubtitle: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  moduleTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginVertical: 4 },
  modulePillsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  modulePill: { backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  modulePillText: { fontSize: 11, fontWeight: '800', color: '#475569' },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 12 },

  // Alerts
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    gap: 12,
  },
  alertIconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  alertTagRed: { fontSize: 9, fontWeight: '900', color: '#dc2626' },
  alertTagBlue: { fontSize: 9, fontWeight: '900', color: '#2563eb' },
  alertTagGreen: { fontSize: 9, fontWeight: '900', color: '#059669' },
  alertTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginTop: 1 },
  alertSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  alertActionBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  alertActionText: { fontSize: 11, fontWeight: '900', color: '#0f172a' },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  browseBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  browseBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
});
