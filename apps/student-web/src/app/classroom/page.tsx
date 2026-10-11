'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, limit } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=800&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  }
  return url;
};

export default function ClassroomPage() {
  const { user, student, loading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classroom' | 'lectures' | 'notes'>('classroom');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const loadEnrolledData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user doc for enrolledCourses array
        const userDocRef = doc(db, 'users', user.uid);
        const uSnap = await getDoc(userDocRef);
        const uData = uSnap.data() || {};
        const enrolledIds: string[] = uData.enrolledCourses || [];

        // 2. Fetch all courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const allCourses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const myCourses: any[] = [];
        for (const c of allCourses) {
          if (enrolledIds.includes(c.id)) {
            myCourses.push(c);
          } else {
            try {
              const subSnap = await getDoc(doc(db, 'courses', c.id, 'enrolledStudents', user.uid));
              if (subSnap.exists()) {
                myCourses.push(c);
              }
            } catch (e) {}
          }
        }

        setEnrolledCourses(myCourses);
        if (myCourses.length > 0) {
          setSelectedCourse(myCourses[0]);
        }

        // 3. Fetch notifications
        try {
          const notifsSnap = await getDocs(query(collection(db, 'users', user.uid, 'notifications'), limit(10)));
          setNotifications(notifsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {}

      } catch (err) {
        console.error('Error fetching enrolled classroom data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEnrolledData();
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-500">Loading your enrolled courses...</span>
          </div>
        ) : enrolledCourses.length === 0 ? (
          /* Empty State when student has not enrolled in any course */
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto border-2 border-blue-100 shadow-sm">
              🎓
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your Classroom is Empty</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              You have not enrolled in any batch program yet. Browse Bikash Bhaiya's curated courses for Class 10th and 12th West Bengal board exams to unlock your full syllabus.
            </p>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
              >
                Explore Courses & Enroll
              </Link>
            </div>
          </div>
        ) : (
          /* Enrolled Classroom Experience (Matching Design Screenshot 4) */
          <div className="space-y-6">
            
            {/* Course Selector Tabs (if enrolled in multiple) */}
            {enrolledCourses.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Switch Course:</span>
                {enrolledCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(c)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                      selectedCourse?.id === c.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            )}

            {/* Course Header Banner */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {selectedCourse?.title?.charAt(0) || 'B'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedCourse?.class || 'Class 12'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">✓ Enrolled & Active</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {selectedCourse?.title}
                  </h1>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Taught by Bikash Chowdhury • West Bengal Board
                  </p>
                </div>
              </div>

              {/* View Sub-pills (Classroom / Lectures / Notes) */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                {[
                  { id: 'classroom', label: 'Dashboard', icon: '📊' },
                  { id: 'lectures', label: 'Lectures', icon: '▶' },
                  { id: 'notes', label: 'Notes & PDFs', icon: '📄' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Progress Meter (Matching Design Screenshot 4) */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    Overall Course Progress
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                    42% Completed
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                    <span className="text-xs font-bold text-slate-500 block">Lectures</span>
                    <span className="text-sm font-black text-blue-700">18 / 42</span>
                  </div>
                  <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
                    <span className="text-xs font-bold text-slate-500 block">Mock Tests</span>
                    <span className="text-sm font-black text-indigo-700">4 / 10</span>
                  </div>
                  <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                    <span className="text-xs font-bold text-slate-500 block">PDF Notes</span>
                    <span className="text-sm font-black text-emerald-700">12 Available</span>
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-blue-600 rounded-full w-[42%] transition-all duration-500" />
              </div>
            </div>

            {/* Tab: Dashboard / Continue Learning */}
            {activeTab === 'classroom' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Continue Learning & Modules */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Continue Learning Card (Matching Design Screenshot 4) */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                      ● Continue Learning
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">
                        Chapter 4: Quadratic Equations & Derivatives
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Lecture 4: Nature of Roots, Discriminant, & Board Exam Formulas
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Chapter Progress</span>
                        <span className="text-blue-600 font-black">68%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-blue-600 rounded-full w-[68%]" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">⏱ 18 mins left in lecture</span>
                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center gap-2"
                      >
                        <span>▶ Continue Lecture</span>
                      </a>
                    </div>
                  </div>

                  {/* Active Modules Overview */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-slate-900">
                      Syllabus Modules Breakdown
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { title: 'Module 1: Real Numbers & Linear Equations', status: 'Completed', count: '8 Lectures' },
                        { title: 'Module 2: Quadratic Equations & Polynomials', status: 'In Progress (68%)', count: '10 Lectures' },
                        { title: 'Module 3: Coordinate Geometry & Vectors', status: 'Next Up', count: '12 Lectures' },
                        { title: 'Module 4: Final Board Model Papers', status: 'Upcoming', count: '6 Lectures' },
                      ].map((m, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">{m.title}</h4>
                              <span className="text-[11px] text-slate-400 font-semibold">{m.count}</span>
                            </div>
                          </div>
                          <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${
                            m.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status.includes('Progress')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right 1 Col: Upcoming & Alerts (Matching Design Screenshot 4) */}
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                      <span>Upcoming & Alerts</span>
                      <span className="text-xs font-bold text-blue-600">Live</span>
                    </h3>

                    {/* LIVE SOON card */}
                    <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-200 text-red-800">
                          🔴 Live Soon
                        </span>
                        <span className="text-xs font-bold text-slate-500">6:00 PM</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">
                        Problem Solving Session
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Live doubt clearing with Bikash Chowdhury
                      </p>
                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl text-center shadow-xs transition"
                      >
                        Join Class
                      </a>
                    </div>

                    {/* UPCOMING TEST card */}
                    <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-800">
                          📝 Upcoming Test
                        </span>
                        <span className="text-xs font-bold text-slate-500">Tomorrow</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">
                        Quadratic Equations Unit Test
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        20 Questions • 45 Minutes Sectional
                      </p>
                    </div>

                    {/* NOTICES from Real Database */}
                    <div className="space-y-2 pt-2 border-t-2 border-slate-100">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">Course Notices</span>
                      {notifications.length > 0 ? (
                        notifications.slice(0, 3).map((n) => (
                          <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <span className="font-black text-slate-900 block">{n.title}</span>
                            <p className="text-slate-500 font-medium line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                          All notices up to date.
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* Tab: Lectures Video List */}
            {activeTab === 'lectures' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-slate-900">Video Lectures Playlist</h3>
                  <span className="text-xs font-bold text-slate-500">Full Access Enabled</span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Lecture 1: Syllabus Orientation & High-Yield Blueprint', duration: '45 mins', status: 'Watched' },
                    { title: 'Lecture 2: Core Concept Visualization & Derivations', duration: '55 mins', status: 'Watched' },
                    { title: 'Lecture 3: Standard Board Exam Questions Solved', duration: '60 mins', status: 'Watched' },
                    { title: 'Lecture 4: Nature of Roots & Discriminant In-Depth', duration: '50 mins', status: 'Resume' },
                    { title: 'Lecture 5: Advanced Board PYQ Mastery (2015-2024)', duration: '65 mins', status: 'Start' },
                  ].map((lec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center border border-blue-200">
                          ▶
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{lec.title}</h4>
                          <span className="text-xs text-slate-400 font-semibold">{lec.duration}</span>
                        </div>
                      </div>

                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                          lec.status === 'Watched'
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                        }`}
                      >
                        {lec.status}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Notes & PDFs */}
            {activeTab === 'notes' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-slate-900">Downloadable Notes & Formula Sheets</h3>
                  <span className="text-xs font-bold text-emerald-600 font-black">✓ PDF Print Allowed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Chapter 1 to 4 Complete Theory Notes', size: 'PDF • 4.2 MB', pages: '32 Pages' },
                    { title: 'High-Yield Formula Cheat Sheet (Board 2026)', size: 'PDF • 1.8 MB', pages: '12 Pages' },
                    { title: 'Last 10 Years Question Bank with Model Answers', size: 'PDF • 6.5 MB', pages: '48 Pages' },
                    { title: 'Class Test 1 & 2 Question Paper and Solutions', size: 'PDF • 2.1 MB', pages: '16 Pages' },
                  ].map((docItem, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <span className="text-3xl">📄</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{docItem.title}</h4>
                          <span className="text-[11px] text-slate-500 font-semibold">{docItem.size} • {docItem.pages}</span>
                        </div>
                      </div>

                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 font-black text-xs rounded-xl border border-blue-200 shadow-xs transition"
                      >
                        Download 📥
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
