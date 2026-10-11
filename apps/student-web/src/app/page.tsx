'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=800&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  }
  return url;
};

export default function StudentHomePage() {
  const { user, student, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseList, setEnrolledCourseList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadRealData = async () => {
      setLoadingData(true);
      try {
        // 1. Fetch real courses from Firestore
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, limit(12));
        const courseSnap = await getDocs(q);
        const allCourses = courseSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(allCourses);

        // 2. Fetch student's real enrolled courses
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const uSnap = await getDoc(userDocRef);
          const uData = uSnap.data() || {};
          const enrolledIds: string[] = uData.enrolledCourses || [];

          // Also check enrolledStudents subcollections across loaded courses
          const enrolledList: any[] = [];
          for (const c of allCourses) {
            if (enrolledIds.includes(c.id)) {
              enrolledList.push(c);
            } else {
              try {
                const subRef = doc(db, 'courses', c.id, 'enrolledStudents', user.uid);
                const subSnap = await getDoc(subRef);
                if (subSnap.exists()) {
                  enrolledList.push(c);
                }
              } catch (e) {
                // Ignore subcollection access warning
              }
            }
          }
          setEnrolledCourseList(enrolledList);

          // 3. Fetch notifications
          try {
            const notifQuery = query(collection(db, 'users', user.uid, 'notifications'), limit(5));
            const notifSnap = await getDocs(notifQuery);
            setRecentNotifications(notifSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } catch (e) {
            // Subcollection may be empty
          }
        }
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    if (!authLoading) {
      loadRealData();
    }
  }, [user, authLoading]);

  const activeEnrolledCourse = enrolledCourseList.length > 0 ? enrolledCourseList[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Greeting Card */}
        <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 border-2 border-blue-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-inner">
                {student?.name ? student.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'B')}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {getTimeGreeting()}, {student?.name || (user?.email ? user.email.split('@')[0] : 'Student')} 👋
                </h1>
                <p className="text-blue-100 font-medium text-sm sm:text-base mt-1">
                  Ready to crush your {student?.className ? `Class ${student.className}` : 'West Bengal Board'} goals?
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/15 text-white backdrop-blur-sm border border-white/20">
                    📚 {enrolledCourseList.length} Active Courses
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-900 shadow-sm">
                    🔥 {student?.streak || 5} Days Streak
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <Link
                href="/courses"
                className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-black text-sm rounded-xl shadow-lg shadow-black/10 transition active:scale-95 flex items-center gap-2"
              >
                <span>Explore Catalog</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Continue Learning Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>▶</span> Continue Learning
            </h2>
            <Link href="/classroom" className="text-blue-600 hover:text-blue-700 font-bold text-sm transition">
              View all courses →
            </Link>
          </div>

          {activeEnrolledCourse ? (
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                      {activeEnrolledCourse.class ? `CLASS ${activeEnrolledCourse.class}` : 'WB BOARD'} • {activeEnrolledCourse.subjects?.[0] || 'GENERAL'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">In Progress</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {activeEnrolledCourse.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">
                    {activeEnrolledCourse.description || 'Complete syllabus lectures and notes prepared by Bikash Bhaiya.'}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="pt-2 max-w-lg space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Progress</span>
                      <span className="text-blue-600 font-black">45% Completed</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-blue-600 rounded-full w-[45%]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:border-l-2 md:border-slate-100 md:pl-6">
                  <Link
                    href={`/classroom`}
                    className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <span>Resume Class</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-dashed border-slate-300 text-center space-y-3">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-blue-100">
                🎓
              </div>
              <h3 className="text-lg font-black text-slate-800">No active course enrolled yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Discover Bikash Bhaiya's complete batch programs for Class 10th & Class 12th West Bengal board exams.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
              >
                Browse Available Courses
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming Live Class Banner */}
        <section className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center text-xl shrink-0">
              🔴
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Live on YouTube
                </span>
                <span className="text-xs text-slate-400 font-semibold">Today at 6:00 PM</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                Live Doubt Clearing & Board Exam Strategy Session
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Conducted by Bikash Chowdhury • WB Arts & Commerce
              </p>
            </div>
          </div>

          <a
            href="https://www.youtube.com/@wbartsbyvikassir"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/20 transition active:scale-95 text-center shrink-0"
          >
            Join Live Class 🔴
          </a>
        </section>

        {/* Featured Courses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured Courses</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Top rated programs designed for West Bengal Board students
              </p>
            </div>
            <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-bold text-sm transition">
              Explore All ({courses.length}) →
            </Link>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl border-2 border-slate-200 animate-pulse p-4 space-y-4">
                  <div className="h-40 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseList.some(e => e.id === course.id);
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Thumbnail */}
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={formatImageUrl(course.imageUrl)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-slate-900 shadow-sm border border-slate-200">
                        {course.class || 'All Classes'}
                      </div>
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-sm">
                        ₹{Number(course.price).toLocaleString()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1 text-amber-500 font-black">
                            ★ 4.9 <span className="text-slate-400 font-medium">({course.enrolledCount || 25}+ students)</span>
                          </span>
                          <span>{course.duration || 'Full Year'}</span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-2">
                          {course.description || 'Comprehensive board syllabus lectures with notes and live doubt classes.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t-2 border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Taught By</span>
                          <span className="text-xs font-bold text-slate-800">Bikash Chowdhury</span>
                        </div>

                        {isEnrolled ? (
                          <Link
                            href="/classroom"
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black text-xs rounded-xl border border-emerald-200 transition"
                          >
                            ✓ Enrolled
                          </Link>
                        ) : (
                          <Link
                            href={`/courses/${course.id}`}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition active:scale-95"
                          >
                            Enroll Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Notes & Tests Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Study Resources</h2>
            <span className="text-xs font-bold text-slate-400">Updated Daily</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 border-2 border-blue-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white text-blue-600 border border-blue-200 flex items-center justify-center text-xl shadow-xs">
                  📄
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Class 12 Arts & Commerce Formula & Revision Sheet</h4>
                  <p className="text-xs text-slate-500 font-medium">PDF • 18 Pages • Download Free</p>
                </div>
              </div>
              <a
                href="https://www.youtube.com/@wbartsbyvikassir"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 font-black text-xs rounded-lg border border-blue-200 shadow-xs transition"
              >
                View PDF 📥
              </a>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border-2 border-emerald-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 border border-emerald-200 flex items-center justify-center text-xl shadow-xs">
                  📝
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Weekly Board Mock Test Series</h4>
                  <p className="text-xs text-slate-500 font-medium">30 Questions • Complete Answer Key</p>
                </div>
              </div>
              <Link
                href="/classroom"
                className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-600 font-black text-xs rounded-lg border border-emerald-200 shadow-xs transition"
              >
                Take Test →
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-slate-200 py-8 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900">Bikash Bhaiya Classes</span>
            <span>•</span>
            <span>West Bengal Board Experts</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <a href="https://wa.me/916290325241" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
              💬 WhatsApp Support: +91 6290325241
            </a>
            <span>•</span>
            <a href="https://www.youtube.com/@wbartsbyvikassir" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
              YouTube Channel
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
