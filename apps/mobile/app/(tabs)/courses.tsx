import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../src/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=600&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w600`;
  }
  return url;
};

export default function MobileCoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'courses')));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.warn('Error fetching courses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const categories = useMemo(() => {
    const list = new Set(['All']);
    courses.forEach(c => {
      if (c.class) list.add(c.class.trim());
      if (Array.isArray(c.subjects)) {
        c.subjects.forEach((s: string) => s && list.add(s.trim()));
      }
    });
    return Array.from(list);
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch =
        search === '' ||
        (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.class || '').toLowerCase().includes(search.toLowerCase());

      const matchCat =
        selectedCategory === 'All' ||
        c.class === selectedCategory ||
        (Array.isArray(c.subjects) && c.subjects.includes(selectedCategory));

      return matchSearch && matchCat;
    });
  }, [courses, search, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Explore Courses</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
      >
        {/* Search Bar (Matching Design Screenshot 3) */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search courses, subjects, or teachers..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills (Matching Design Screenshot 3) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Special Bundle Offer (Matching Design Screenshot 3) */}
        <View style={styles.bundleCard}>
          <View style={styles.bundleTag}>
            <Text style={styles.bundleTagText}>SPECIAL BUNDLE OFFER • Limited Time</Text>
          </View>
          <Text style={styles.bundleTitle}>West Bengal Board All-in-One Batch</Text>
          <Text style={styles.bundleSub}>
            Complete syllabus coverage with live doubt classes and digital handwritten notes.
          </Text>
          <View style={styles.bundleFooter}>
            <View>
              <Text style={styles.bundleOldPrice}>₹4,999</Text>
              <Text style={styles.bundleNewPrice}>₹1,999 / full batch</Text>
            </View>
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => Linking.openURL('https://wa.me/916290325241?text=Hello%20Bikash%20Bhaiya%2C%20I%20want%20to%20claim%20the%20Special%20Bundle%20Offer')}
              activeOpacity={0.8}
            >
              <Text style={styles.claimBtnText}>Claim Bundle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Courses List Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Courses ({filtered.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginVertical: 30 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No courses match your filter.</Text>
          </View>
        ) : (
          /* Course Cards List (Matching Design Screenshot 3) */
          <View style={styles.courseList}>
            {filtered.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push(`/courses/${course.id}` as any)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: formatImageUrl(course.imageUrl) }} style={styles.courseThumbnail} />
                <View style={styles.courseDetails}>
                  <View style={styles.classRow}>
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{course.class || 'WB Board'}</Text>
                    </View>
                    <Text style={styles.ratingText}>★ 4.9</Text>
                  </View>

                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {course.title}
                  </Text>
                  <Text style={styles.teacherName}>By Bikash Chowdhury</Text>

                  <View style={styles.durationRow}>
                    <Text style={styles.durationText}>⏱ {course.duration || 'Full Year'}</Text>
                    <Text style={styles.durationText}>📚 40+ lectures</Text>
                  </View>

                  <View style={styles.courseFooter}>
                    <Text style={styles.priceAmount}>
                      ₹{Number(course.price || 0).toLocaleString()}
                    </Text>
                    <View style={styles.enrollBtnSmall}>
                      <Text style={styles.enrollBtnText}>Enroll Now</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  scrollContent: { padding: 18, paddingBottom: 40 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, fontWeight: '700', color: '#0f172a' },
  clearIcon: { fontSize: 14, color: '#94a3b8', padding: 4 },

  filterPillsRow: { gap: 8, paddingBottom: 16 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  pillText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  pillTextActive: { color: '#ffffff' },

  bundleCard: {
    backgroundColor: '#2563eb',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bundleTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bundleTagText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  bundleTitle: { color: '#ffffff', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  bundleSub: { color: '#dbeafe', fontSize: 12, lineHeight: 16, marginBottom: 14 },
  bundleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bundleOldPrice: { color: '#bfdbfe', fontSize: 11, textDecorationLine: 'line-through' },
  bundleNewPrice: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  claimBtn: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  claimBtnText: { color: '#2563eb', fontSize: 12, fontWeight: '900' },

  sectionHeaderRow: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },

  courseList: { gap: 14 },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 12,
  },
  courseThumbnail: { width: 100, height: 110, borderRadius: 14 },
  courseDetails: { flex: 1, justifyContent: 'space-between' },
  classRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  classBadgeText: { color: '#2563eb', fontSize: 10, fontWeight: '900' },
  ratingText: { color: '#f59e0b', fontSize: 11, fontWeight: '900' },
  courseTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginVertical: 2 },
  teacherName: { fontSize: 11, color: '#64748b' },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationText: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceAmount: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  enrollBtnSmall: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  enrollBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },

  emptyView: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
});
