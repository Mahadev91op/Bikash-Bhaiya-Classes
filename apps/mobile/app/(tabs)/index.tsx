import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';
import { auth, db } from '../../src/lib/firebase';
import { collection, query, getDocs, doc, getDoc, limit } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=600&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w600`;
  }
  return url;
};

export default function MobileHomeScreen() {
  const router = useRouter();
  const { handleScroll } = useTabBarVisibility();
  const [student, setStudent] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourse, setEnrolledCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 1. Fetch user doc
        const uSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (uSnap.exists()) {
          setStudent(uSnap.data());
        }

        // 2. Fetch courses
        const cSnap = await getDocs(query(collection(db, 'courses'), limit(8)));
        const courseList = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(courseList);

        // 3. Check enrolled course
        const uData = uSnap.data() || {};
        const enrolledIds: string[] = uData.enrolledCourses || [];
        let myCourse = null;

        for (const c of courseList) {
          if (enrolledIds.includes(c.id)) {
            myCourse = c;
            break;
          }
          try {
            const sub = await getDoc(doc(db, 'courses', c.id, 'enrolledStudents', currentUser.uid));
            if (sub.exists()) {
              myCourse = c;
              break;
            }
          } catch (e) {}
        }
        setEnrolledCourse(myCourse);
      }
    } catch (err) {
      console.warn('Error fetching home data:', err);
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

  const studentName = student?.name || auth.currentUser?.email?.split('@')[0] || 'Student';
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{studentInitial}</Text>
          </View>
          <View>
            <Text style={styles.headerSub}>Welcome back,</Text>
            <Text style={styles.headerName}>{studentName}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.bellBtn} 
          onPress={() => router.push('/(tabs)/alerts' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
      >
        {/* Greeting Banner Card (Matching Design Screenshot 1) */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <View style={styles.greetingAvatar}>
              <Text style={styles.greetingInitial}>{studentInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingTitle}>
                {getTimeGreeting()}, {studentName}
              </Text>
              <Text style={styles.greetingSub}>
                Ready to crush your {student?.className ? `Class ${student.className}` : 'WB Board'} goals?
              </Text>
            </View>
          </View>

          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{student?.streak || 5}</Text>
            <Text style={styles.streakLabel}>Days Streak</Text>
          </View>
        </View>

        {/* Continue Learning Section (Matching Design Screenshot 1) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/learning' as any)}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {enrolledCourse ? (
          <View style={styles.continueCard}>
            <View style={styles.continueHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.continueTag}>
                  {enrolledCourse.class ? `CLASS ${enrolledCourse.class}` : 'WB BOARD'} • {enrolledCourse.subjects?.[0] || 'GENERAL'}
                </Text>
                <Text style={styles.continueTitle}>{enrolledCourse.title}</Text>
                <Text style={styles.continueSub}>Lecture 4: Core Concepts & Formulas</Text>
              </View>

              <View style={styles.playCircle}>
                <Ionicons name="play" size={16} color="#ffffff" style={{ marginLeft: 2 }} />
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>65% Completed</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
            </View>

            <View style={styles.continueFooter}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={13} color="#64748b" />
                <Text style={styles.timeLeftText}>18 mins left</Text>
              </View>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => router.push('/(tabs)/learning' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.continueBtnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyContinueCard}
            onPress={() => router.push('/(tabs)/courses' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="school-outline" size={40} color="#2563eb" />
            <Text style={styles.emptyContinueTitle}>Start Your Learning Journey</Text>
            <Text style={styles.emptyContinueSub}>Explore Bikash Bhaiya's complete batch programs</Text>
            <View style={styles.exploreBtnSmall}>
              <Text style={styles.exploreBtnText}>Browse Courses</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Upcoming Live Class Banner (Matching Design Screenshot 1) */}
        <View style={styles.liveCard}>
          <View style={styles.liveHeaderRow}>
            <Text style={styles.liveSectionTitle}>Upcoming Live Class</Text>
            <View style={styles.liveTag}>
              <Text style={styles.liveTagText}>● Live at 6:00 PM</Text>
            </View>
          </View>

          <View style={styles.liveContentRow}>
            <View style={styles.liveTeacherAvatar}>
              <Text style={styles.liveTeacherInitial}>B</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.liveTeacherName}>Bikash Chowdhury • Live Session</Text>
              <Text style={styles.liveTopic}>Board Suggestion & Doubt Clearing</Text>
              <Text style={styles.liveSub}>Clearing exam doubts live on YouTube</Text>
            </View>
            <TouchableOpacity
              style={styles.joinLiveBtn}
              onPress={() => Linking.openURL('https://www.youtube.com/@wbartsbyvikassir')}
              activeOpacity={0.8}
            >
              <Text style={styles.joinLiveText}>Join Live</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Courses Section (Matching Design Screenshot 1) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Courses</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/courses' as any)}>
            <Text style={styles.viewAllText}>Explore all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/courses/${course.id}` as any)}
                activeOpacity={0.9}
              >
                <View style={styles.featuredImgWrapper}>
                  <Image source={{ uri: formatImageUrl(course.imageUrl) }} style={styles.featuredImg} />
                  <View style={styles.pricePill}>
                    <Text style={styles.priceText}>₹{Number(course.price || 0).toLocaleString()}</Text>
                  </View>
                </View>

                <View style={styles.featuredContent}>
                  <Text style={styles.featuredClass}>{course.class || 'WB Board'}</Text>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {course.title}
                  </Text>
                  <Text style={styles.featuredTeacher}>By Bikash Chowdhury</Text>

                  <View style={styles.featuredFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.featuredRating}>4.9</Text>
                    </View>
                    <Text style={styles.enrollNowText}>Enroll Now →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Recent Notes & Tests Section (Matching Design Screenshot 1) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Notes & Tests</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/learning' as any)}>
            <Text style={styles.viewAllText}>View library</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notesGrid}>
          <TouchableOpacity
            style={styles.noteItemCard}
            onPress={() => Linking.openURL('https://www.youtube.com/@wbartsbyvikassir')}
            activeOpacity={0.8}
          >
            <View style={[styles.noteIconCircle, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="document-text-outline" size={22} color="#2563eb" />
            </View>
            <Text style={styles.noteTitle} numberOfLines={1}>Class 12 Formula Sheet</Text>
            <Text style={styles.noteSub}>All Subjects • 16 pages</Text>
            <Text style={styles.noteActionText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.noteItemCard}
            onPress={() => router.push('/(tabs)/learning' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.noteIconCircle, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="create-outline" size={22} color="#059669" />
            </View>
            <Text style={styles.noteTitle} numberOfLines={1}>Weekly Board Mock Test</Text>
            <Text style={styles.noteSub}>Board Pattern • 20 Qs</Text>
            <Text style={[styles.noteActionText, { color: '#059669' }]}>Start Test →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  headerSub: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  headerName: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: { fontSize: 18 },

  scrollContent: { padding: 18, paddingBottom: 40 },

  // Greeting Banner
  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 20,
  },
  greetingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  greetingAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingInitial: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  greetingTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  greetingSub: { fontSize: 12, color: '#475569', marginTop: 2, fontWeight: '600' },
  streakBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  streakNumber: { fontSize: 16, fontWeight: '900', color: '#059669' },
  streakLabel: { fontSize: 10, color: '#64748b', fontWeight: '700' },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  viewAllText: { fontSize: 13, fontWeight: '800', color: '#2563eb' },

  // Continue Learning
  continueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  continueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  continueTag: { fontSize: 10, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 },
  continueTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  continueSub: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 16, color: '#2563eb' },
  progressSection: { marginVertical: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  progressValue: { fontSize: 12, color: '#2563eb', fontWeight: '900' },
  progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#2563eb', borderRadius: 3 },
  continueFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLeftText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  continueBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  continueBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },

  emptyContinueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyContinueIcon: { fontSize: 32, marginBottom: 6 },
  emptyContinueTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  emptyContinueSub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 12 },
  exploreBtnSmall: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  exploreBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },

  // Live Class
  liveCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 22,
  },
  liveHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveSectionTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  liveTag: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveTagText: { color: '#dc2626', fontSize: 10, fontWeight: '900' },
  liveContentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveTeacherAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },
  liveTeacherInitial: { color: '#fff', fontSize: 18, fontWeight: '900' },
  liveTeacherName: { fontSize: 11, color: '#64748b', fontWeight: '700' },
  liveTopic: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  liveSub: { fontSize: 11, color: '#94a3b8' },
  joinLiveBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  joinLiveText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },

  // Featured Courses Horizontal
  horizontalScroll: { gap: 14, paddingRight: 10, marginBottom: 22 },
  featuredCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featuredImgWrapper: { width: '100%', height: 120, position: 'relative' },
  featuredImg: { width: '100%', height: '100%' },
  pricePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  featuredContent: { padding: 12 },
  featuredClass: { fontSize: 10, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', marginBottom: 2 },
  featuredTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 4, height: 36 },
  featuredTeacher: { fontSize: 11, color: '#64748b', marginBottom: 10 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredRating: { fontSize: 11, fontWeight: '900', color: '#f59e0b' },
  enrollNowText: { fontSize: 11, fontWeight: '900', color: '#2563eb' },

  // Notes & Tests
  notesGrid: { flexDirection: 'row', gap: 12 },
  noteItemCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noteIconCircle: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  noteTitle: { fontSize: 12, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  noteSub: { fontSize: 10, color: '#64748b', marginBottom: 8 },
  noteActionText: { fontSize: 11, fontWeight: '900', color: '#2563eb' },
});
