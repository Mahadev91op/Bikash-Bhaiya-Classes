'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, limit } from 'firebase/firestore';
import {
  GraduationCap,
  CheckCircle2,
  LayoutDashboard,
  Play,
  FileText,
  FileCheck,
  Radio,
  Bell,
  Download,
  ArrowRight,
} from 'lucide-react';

export default function ClassroomPage() {
  const { user, loading: authLoading } = useAuth();
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
        const userDocRef = doc(db, 'users', user.uid);
        const uSnap = await getDoc(userDocRef);
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
              const subSnap = await getDoc(doc(db, 'courses', c.id, 'enrolledStudents', user.uid));
              if (subSnap.exists()) myCourses.push(c);
            } catch (e) {}
          }
        }

        setEnrolledCourses(myCourses);
        if (myCourses.length > 0) {
          setSelectedCourse(myCourses[0]);
        }

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500">Loading your enrolled courses...</span>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-3">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Your Classroom is Empty</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You have not enrolled in any batch program yet. Browse Bikash Bhaiya's curated courses for Class 10th and 12th West Bengal board exams to unlock your full syllabus.
            </p>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95"
              >
                <span>Explore Courses & Enroll</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Course Selector Tabs */}
            {enrolledCourses.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Switch Course:</span>
                {enrolledCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCourse?.id === c.id
                        ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            )}

            {/* Course Header Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs shrink-0">
                  {selectedCourse?.title?.charAt(0) || 'B'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedCourse?.class || 'Class 12'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enrolled & Active</span>
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {selectedCourse?.title}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Taught by Bikash Chowdhury • West Bengal Board
                  </p>
                </div>
              </div>

              {/* Sub-pills (Classroom / Lectures / Notes) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
                {[
                  { id: 'classroom', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'lectures', label: 'Lectures', icon: Play },
                  { id: 'notes', label: 'Notes & PDFs', icon: FileText },
                ].map((tab) => {
                  const IconC = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <IconC className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overall Progress Meter */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Overall Course Progress
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    42% Completed
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">Lectures</span>
                    <span className="text-xs font-extrabold text-blue-700">18 / 42</span>
                  </div>
                  <div className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">Mock Tests</span>
                    <span className="text-xs font-extrabold text-indigo-700">4 / 10</span>
                  </div>
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 block">PDF Notes</span>
                    <span className="text-xs font-extrabold text-emerald-700">12 Available</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-blue-600 rounded-full w-[42%] transition-all duration-500" />
              </div>
            </div>

            {/* Tab: Dashboard / Continue Learning */}
            {activeTab === 'classroom' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Continue Learning Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Continue Learning</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Chapter 4: Quadratic Equations & Derivatives
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Lecture 4: Nature of Roots, Discriminant, & Board Exam Formulas
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Chapter Progress</span>
                        <span className="text-blue-600 font-extrabold">68%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-blue-600 rounded-full w-[68%]" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">18 mins left in lecture</span>
                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Continue Lecture</span>
                      </a>
                    </div>
                  </div>

                  {/* Active Modules Overview */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Syllabus Modules Breakdown
                    </h3>
                    
                    <div className="space-y-2.5">
                      {[
                        { title: 'Module 1: Real Numbers & Linear Equations', status: 'Completed', count: '8 Lectures' },
                        { title: 'Module 2: Quadratic Equations & Polynomials', status: 'In Progress (68%)', count: '10 Lectures' },
                        { title: 'Module 3: Coordinate Geometry & Vectors', status: 'Next Up', count: '12 Lectures' },
                        { title: 'Module 4: Final Board Model Papers', status: 'Upcoming', count: '6 Lectures' },
                      ].map((m, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                              <span className="text-[11px] text-slate-400 font-medium">{m.count}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${
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

                {/* Right 1 Col */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                      <span>Upcoming & Alerts</span>
                      <span className="text-xs font-bold text-blue-600">Live</span>
                    </h3>

                    {/* LIVE SOON card */}
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-red-200 text-red-800 flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>Live Soon</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-500">6:00 PM</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Problem Solving Session
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Live doubt clearing with Bikash Chowdhury
                      </p>
                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl text-center shadow-xs transition"
                      >
                        Join Class
                      </a>
                    </div>

                    {/* UPCOMING TEST card */}
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-800 flex items-center gap-1">
                          <FileCheck className="w-3 h-3" />
                          <span>Upcoming Test</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Tomorrow</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Quadratic Equations Unit Test
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        20 Questions • 45 Minutes Sectional
                      </p>
                    </div>

                    {/* Course Notices */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Course Notices</span>
                      {notifications.length > 0 ? (
                        notifications.slice(0, 3).map((n) => (
                          <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-900 block">{n.title}</span>
                            <p className="text-slate-500 font-medium line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center font-medium">
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
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-slate-900">Video Lectures Playlist</h3>
                  <span className="text-xs font-semibold text-slate-500">Full Access Enabled</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: 'Lecture 1: Syllabus Orientation & High-Yield Blueprint', duration: '45 mins', status: 'Watched' },
                    { title: 'Lecture 2: Core Concept Visualization & Derivations', duration: '55 mins', status: 'Watched' },
                    { title: 'Lecture 3: Standard Board Exam Questions Solved', duration: '60 mins', status: 'Watched' },
                    { title: 'Lecture 4: Nature of Roots & Discriminant In-Depth', duration: '50 mins', status: 'Resume' },
                    { title: 'Lecture 5: Advanced Board PYQ Mastery (2015-2024)', duration: '65 mins', status: 'Start' },
                  ].map((lec, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">{lec.title}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">{lec.duration}</span>
                        </div>
                      </div>

                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          lec.status === 'Watched'
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-blue-600 text-white shadow-2xs hover:bg-blue-700'
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
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold text-slate-900">Downloadable Notes & Formula Sheets</h3>
                  <span className="text-xs font-extrabold text-emerald-600">✓ PDF Print Allowed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { title: 'Chapter 1 to 4 Complete Theory Notes', size: 'PDF • 4.2 MB', pages: '32 Pages' },
                    { title: 'High-Yield Formula Cheat Sheet (Board 2026)', size: 'PDF • 1.8 MB', pages: '12 Pages' },
                    { title: 'Last 10 Years Question Bank with Model Answers', size: 'PDF • 6.5 MB', pages: '48 Pages' },
                    { title: 'Class Test 1 & 2 Question Paper and Solutions', size: 'PDF • 2.1 MB', pages: '16 Pages' },
                  ].map((docItem, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{docItem.title}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{docItem.size} • {docItem.pages}</span>
                        </div>
                      </div>

                      <a
                        href="https://www.youtube.com/@wbartsbyvikassir"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
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
