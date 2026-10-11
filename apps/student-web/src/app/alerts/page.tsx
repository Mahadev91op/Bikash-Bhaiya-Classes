'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Bell, PartyPopper, Tv, CheckCheck, Check } from 'lucide-react';

export default function AlertsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcements' | 'academic'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const notifsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notifsRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setNotifications(list);
      setLoading(false);
    }, (err) => {
      console.warn('Notifications snapshot error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleMarkAsRead = async (notifId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), {
        read: true
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.warn(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'announcements') return n.type === 'announcement' || n.category === 'announcement';
    if (filter === 'academic') return n.type === 'enrollment' || n.type === 'lecture' || n.category === 'academic';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header & Mark All Read (Matching Design Screenshot 7) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Notification Screen</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Stay updated with class schedules and announcements</p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filter Pills (Matching Design Screenshot 7) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                filter === 'unread' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter('announcements')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              filter === 'announcements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            Announcements
          </button>

          <button
            type="button"
            onClick={() => setFilter('academic')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              filter === 'academic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border-2 border-slate-200'
            }`}
          >
            Academic
          </button>
        </div>

        {/* Notifications List (Matching Design Screenshot 7) */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No notifications in this view</h3>
            <p className="text-xs text-slate-500 font-medium">You are all caught up with your classes and announcements.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition relative ${
                  item.read
                    ? 'bg-white border-slate-200'
                    : 'bg-blue-50/40 border-blue-200 shadow-xs'
                }`}
              >
                {!item.read && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}

                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'enrollment' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.type === 'enrollment' ? (
                      <PartyPopper className="w-5 h-5" />
                    ) : (
                      <Tv className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-600">
                        {item.type || 'Academic'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• Real-time</span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.message}</p>

                    <div className="pt-2 flex items-center gap-3">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                          Mark as read
                        </button>
                      )}
                      {item.courseId && (
                        <a
                          href="/classroom"
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition"
                        >
                          Go to Classroom
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
