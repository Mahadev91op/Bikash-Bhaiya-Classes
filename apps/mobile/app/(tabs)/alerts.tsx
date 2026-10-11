import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../src/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';

export default function MobileAlertsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcements' | 'academic'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(list);
      setLoading(false);
      setRefreshing(false);
    }, (err) => {
      console.warn('Notifications snapshot error:', err);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsub();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'announcements') return n.type === 'announcement' || n.category === 'announcement';
    if (filter === 'academic') return n.type === 'enrollment' || n.type === 'lecture';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header (Matching Design Screenshot 7) */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Notification Screen</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills (Matching Design Screenshot 7) */}
      <View style={styles.pillsRow}>
        <TouchableOpacity
          style={[styles.pill, filter === 'all' && styles.pillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.pillText, filter === 'all' && styles.pillTextActive]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, filter === 'unread' && styles.pillActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.pillText, filter === 'unread' && styles.pillTextActive]}>
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, filter === 'announcements' && styles.pillActive]}
          onPress={() => setFilter('announcements')}
        >
          <Text style={[styles.pillText, filter === 'announcements' && styles.pillTextActive]}>Announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pill, filter === 'academic' && styles.pillActive]}
          onPress={() => setFilter('academic')}
        >
          <Text style={[styles.pillText, filter === 'academic' && styles.pillTextActive]}>Academic</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} colors={['#2563eb']} />}
      >
        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginVertical: 30 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>You are all caught up with your classes.</Text>
          </View>
        ) : (
          <View style={styles.notifsList}>
            {filtered.map((item) => (
              <View
                key={item.id}
                style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              >
                {!item.read && <View style={styles.unreadDot} />}
                <View style={styles.notifRow}>
                  <View style={[styles.notifIconCircle, item.type === 'enrollment' ? { backgroundColor: '#ecfdf5' } : { backgroundColor: '#eff6ff' }]}>
                    <Text style={{ fontSize: 18 }}>{item.type === 'enrollment' ? '🎉' : '📺'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.notifMetaRow}>
                      <Text style={styles.notifCategory}>{item.type || 'Academic'}</Text>
                      <Text style={styles.notifTime}>• Just now</Text>
                    </View>

                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifMessage}>{item.message}</Text>

                    <View style={styles.notifActionsRow}>
                      {!item.read && (
                        <TouchableOpacity
                          style={styles.markBtn}
                          onPress={() => handleMarkAsRead(item.id)}
                        >
                          <Text style={styles.markBtnText}>Mark as read</Text>
                        </TouchableOpacity>
                      )}
                      {item.courseId && (
                        <TouchableOpacity
                          style={styles.classBtn}
                          onPress={() => router.push('/(tabs)/learning' as any)}
                        >
                          <Text style={styles.classBtnText}>Go to Class →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  markAllText: { fontSize: 12, fontWeight: '800', color: '#2563eb' },

  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f1f5f9' },
  pillActive: { backgroundColor: '#2563eb' },
  pillText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  pillTextActive: { color: '#ffffff' },

  scrollContent: { padding: 18, paddingBottom: 40 },
  notifsList: { gap: 12 },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  notifCardUnread: { backgroundColor: '#f8faff', borderColor: '#bfdbfe' },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  notifRow: { flexDirection: 'row', gap: 12 },
  notifIconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notifMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  notifCategory: { fontSize: 10, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase' },
  notifTime: { fontSize: 10, color: '#94a3b8' },
  notifTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  notifMessage: { fontSize: 11, color: '#64748b', lineHeight: 16 },
  notifActionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  markBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#f1f5f9' },
  markBtnText: { fontSize: 10, fontWeight: '800', color: '#64748b' },
  classBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#2563eb' },
  classBtnText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },

  emptyView: { padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#64748b' },
});
