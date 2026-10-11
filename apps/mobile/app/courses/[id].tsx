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
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=800&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  }
  return url;
};

export default function MobileCourseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const courseId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'curriculum' | 'benefits'>('about');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const snap = await getDoc(doc(db, 'courses', courseId));
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() });

          // Check if student enrolled
          if (auth.currentUser) {
            const uSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const eIds: string[] = uSnap.data()?.enrolledCourses || [];
            if (eIds.includes(courseId)) {
              setIsEnrolled(true);
            } else {
              const subSnap = await getDoc(doc(db, 'courses', courseId, 'enrolledStudents', auth.currentUser.uid));
              if (subSnap.exists()) setIsEnrolled(true);
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${course?.title} on Bikash Bhaiya Classes!`,
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Course not found</Text>
      </View>
    );
  }

  const originalPrice = Math.round(Number(course.price || 0) * 1.8);

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerCategory}>{course.class || 'WB Board'}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={{ fontSize: 16 }}>🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Banner with Stats Overlay (Matching Design Screenshot 2) */}
        <View style={styles.bannerWrapper}>
          <Image source={{ uri: formatImageUrl(course.imageUrl) }} style={styles.bannerImg} />
          <View style={styles.bannerOverlay}>
            <View style={styles.topChipsRow}>
              <View style={styles.classChip}>
                <Text style={styles.classChipText}>{course.class || 'Class 12'}</Text>
              </View>
              <View style={styles.ratingChip}>
                <Text style={styles.ratingChipText}>★ 4.9 (1.2k)</Text>
              </View>
            </View>

            <View style={styles.bottomStatsRow}>
              <View style={styles.statPill}><Text style={styles.statPillText}>⏱ {course.duration || 'Full Year'}</Text></View>
              <View style={styles.statPill}><Text style={styles.statPillText}>📚 48 lectures</Text></View>
              <View style={styles.statPill}><Text style={styles.statPillText}>✓ WB Board</Text></View>
            </View>
          </View>
        </View>

        {/* Course Title & Description */}
        <View style={styles.titleSection}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDesc}>
            {course.description || 'Comprehensive board syllabus lectures mapped directly to latest standards with concept clarity and shortcut techniques.'}
          </Text>
        </View>

        {/* Educator Card (Matching Design Screenshot 2) */}
        <View style={styles.educatorCard}>
          <View style={styles.educatorAvatar}>
            <Text style={styles.educatorInitial}>B</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.educatorName}>Bikash Chowdhury</Text>
              <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>✓</Text>
            </View>
            <Text style={styles.educatorBio}>Senior Board Educator • 10+ Years Experience</Text>
          </View>
        </View>

        {/* Pricing Box (Matching Design Screenshot 2) */}
        <View style={styles.priceBox}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={styles.priceMain}>₹{Number(course.price || 0).toLocaleString()}</Text>
              <Text style={styles.priceCrossed}>₹{originalPrice.toLocaleString()}</Text>
            </View>
            <Text style={styles.priceDiscount}>🔥 Special Discount - 45% OFF</Text>
          </View>

          {isEnrolled ? (
            <TouchableOpacity
              style={[styles.buyBtn, { backgroundColor: '#059669' }]}
              onPress={() => router.push('/(tabs)/learning' as any)}
            >
              <Text style={styles.buyBtnText}>In Class ✓</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => router.push(`/checkout/${course.id}` as any)}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Pills */}
        <View style={styles.tabsRow}>
          {[
            { id: 'about', label: 'About' },
            { id: 'curriculum', label: 'Curriculum' },
            { id: 'benefits', label: 'Benefits' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, activeTab === t.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(t.id as any)}
            >
              <Text style={[styles.tabBtnText, activeTab === t.id && styles.tabBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content: About */}
        {activeTab === 'about' && (
          <View style={styles.cardBox}>
            <Text style={styles.cardBoxTitle}>Course Overview</Text>
            <Text style={styles.cardBoxText}>
              This complete course is meticulously designed to transform your conceptual understanding into exam excellence. Taught by Bikash Chowdhury, the curriculum breaks down complex theorems, algebraic equations, and theoretical questions into intuitive visual steps.
            </Text>

            <Text style={[styles.cardBoxTitle, { marginTop: 14 }]}>Teaching Methodology</Text>
            <Text style={styles.cardBoxText}>
              We utilize a 3-step learning loop: Conceptual Visualization, Guided Problem Solving with previous year papers, and Weekly Mock Test simulation.
            </Text>
          </View>
        )}

        {/* Tab Content: Curriculum (Matching Design Screenshot 2) */}
        {activeTab === 'curriculum' && (
          <View style={styles.cardBox}>
            <Text style={styles.cardBoxTitle}>Course Curriculum • 4 Modules</Text>
            <View style={{ gap: 10, marginTop: 10 }}>
              {[
                { num: 1, title: 'Real Numbers & Core Formulas', sub: '6 lectures • 4.5 hrs', tag: 'Unlocked' },
                { num: 2, title: 'Polynomials & Linear Equations', sub: '8 lectures • 6.0 hrs', tag: isEnrolled ? 'Unlocked' : 'Locked' },
                { num: 3, title: 'Quadratic Equations & Roots', sub: '10 lectures • 7.5 hrs', tag: isEnrolled ? 'Unlocked' : 'Locked' },
                { num: 4, title: 'Board Question Bank & Solutions', sub: '12 lectures • 9.0 hrs', tag: isEnrolled ? 'Unlocked' : 'Locked' },
              ].map((m) => (
                <View key={m.num} style={styles.curriculumItem}>
                  <View style={styles.moduleCircle}><Text style={styles.moduleCircleText}>{m.num}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleName}>{m.title}</Text>
                    <Text style={styles.moduleDuration}>{m.sub}</Text>
                  </View>
                  <View style={[styles.unlockBadge, m.tag === 'Unlocked' ? { backgroundColor: '#ecfdf5' } : { backgroundColor: '#f1f5f9' }]}>
                    <Text style={[styles.unlockBadgeText, m.tag === 'Unlocked' ? { color: '#059669' } : { color: '#64748b' }]}>
                      {m.tag}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tab Content: Benefits */}
        {activeTab === 'benefits' && (
          <View style={styles.cardBox}>
            <Text style={styles.cardBoxTitle}>Key Benefits</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              {[
                'Full syllabus coverage according to latest WB Board rules',
                'Downloadable & printable PDF notes for all chapters',
                'Direct live doubt solving with Bikash Chowdhury',
                'Weekly timed tests with complete solution analysis',
              ].map((b, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#059669', fontWeight: 'bold' }}>✓</Text>
                  <Text style={{ fontSize: 12, color: '#334155', fontWeight: '600' }}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Floating Bottom Sticky Bar (Matching Design Screenshot 2) */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Total Price</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={styles.bottomBarPrice}>₹{Number(course.price || 0).toLocaleString()}</Text>
            <Text style={styles.bottomBarOldPrice}>₹{originalPrice.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => Linking.openURL('https://www.youtube.com/@wbartsbyvikassir')}
            activeOpacity={0.8}
          >
            <Text style={styles.previewBtnText}>Watch Preview</Text>
          </TouchableOpacity>

          {isEnrolled ? (
            <TouchableOpacity
              style={[styles.enrollBtn, { backgroundColor: '#059669' }]}
              onPress={() => router.push('/(tabs)/learning' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.enrollBtnText}>Access Class ✓</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.enrollBtn}
              onPress={() => router.push(`/checkout/${course.id}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.enrollBtnText}>Enroll Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { justifyContent: 'center', alignItems: 'center' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  headerCategory: { fontSize: 13, fontWeight: '900', color: '#2563eb' },
  shareBtn: { padding: 4 },

  scrollContent: { padding: 18, paddingBottom: 100 },

  bannerWrapper: { height: 200, borderRadius: 22, overflow: 'hidden', position: 'relative', marginBottom: 18 },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 14,
  },
  topChipsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  classChip: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  classChipText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  ratingChip: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ratingChipText: { color: '#f59e0b', fontSize: 11, fontWeight: '900' },
  bottomStatsRow: { flexDirection: 'row', gap: 6 },
  statPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statPillText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  titleSection: { marginBottom: 16 },
  courseTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  courseDesc: { fontSize: 12, color: '#64748b', lineHeight: 18, fontWeight: '500' },

  educatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 16,
  },
  educatorAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  educatorInitial: { color: '#fff', fontSize: 18, fontWeight: '900' },
  educatorName: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  educatorBio: { fontSize: 11, color: '#64748b' },

  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 18,
  },
  priceMain: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  priceCrossed: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through' },
  priceDiscount: { fontSize: 10, fontWeight: '900', color: '#059669', marginTop: 2 },
  buyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  buyBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  tabBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabBtnText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  tabBtnTextActive: { color: '#ffffff' },

  cardBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  cardBoxTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  cardBoxText: { fontSize: 12, color: '#64748b', lineHeight: 18 },

  curriculumItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f8fafc', borderRadius: 12, gap: 10 },
  moduleCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  moduleCircleText: { fontSize: 12, fontWeight: '900', color: '#2563eb' },
  moduleName: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  moduleDuration: { fontSize: 10, color: '#94a3b8' },
  unlockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  unlockBadgeText: { fontSize: 10, fontWeight: '800' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  bottomBarPrice: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  bottomBarOldPrice: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  previewBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  previewBtnText: { color: '#475569', fontSize: 12, fontWeight: '800' },
  enrollBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  enrollBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
});
