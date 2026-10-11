'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=1000&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
  }
  return url;
};

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const { user } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'curriculum' | 'benefits' | 'notes'>('about');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const cRef = doc(db, 'courses', courseId);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          const data = { id: cSnap.id, ...cSnap.data() };
          setCourse(data);

          // Check if user is enrolled
          if (user) {
            const userSnap = await getDoc(doc(db, 'users', user.uid));
            const uData = userSnap.data() || {};
            const eIds: string[] = uData.enrolledCourses || [];
            if (eIds.includes(courseId)) {
              setIsEnrolled(true);
            } else {
              try {
                const subSnap = await getDoc(doc(db, 'courses', courseId, 'enrolledStudents', user.uid));
                if (subSnap.exists()) setIsEnrolled(true);
              } catch (e) {}
            }
          }
        } else {
          router.push('/courses');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user, router]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-500">Loading course details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const originalPrice = Math.round(Number(course.price || 0) * 1.8);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-28">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <span>←</span> Back to Courses
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <span>{copiedShare ? '✓ Copied Link' : '🔗 Share'}</span>
            </button>
            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-black text-blue-700">
              {course.class || 'Board Course'}
            </span>
          </div>
        </div>

        {/* Hero Visual Banner (Matching Design Screenshot 2) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
          <div className="h-64 sm:h-80 bg-slate-900 relative">
            <img
              src={formatImageUrl(course.imageUrl)}
              alt={course.title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Overlay Chips */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md">
                {course.class || 'WB Board'}
              </span>
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-amber-400 rounded-xl text-xs font-black border border-white/10 shadow-md">
                ★ 4.9 (1,200+ Reviews)
              </span>
            </div>

            {/* Bottom Overlay Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white">
              <span className="px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                ⏱ {course.duration || 'Full Academic Year'}
              </span>
              <span className="px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                📚 48+ Video Lectures
              </span>
              <span className="px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                ✓ WBCHSE / WBBSE Syllabus
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {course.title}
              </h1>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                {course.description || 'Comprehensive conceptual course mapped directly to the latest board exam standards with shortcuts, numericals, and doubt solving.'}
              </p>
            </div>

            {/* Educator Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  B
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-slate-900">Bikash Chowdhury</h3>
                    <span className="text-blue-600 font-bold text-sm" title="Verified Educator">✓</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Founder & Lead Educator • 10+ Years Experience in WB Board
                  </p>
                </div>
              </div>

              <a
                href="https://www.youtube.com/@wbartsbyvikassir"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition"
              >
                YouTube Channel
              </a>
            </div>

            {/* Pricing Card */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{Number(course.price).toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-slate-400 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 mt-1">
                  🔥 Special Limited-Time Discount - 45% OFF
                </span>
              </div>

              {isEnrolled ? (
                <Link
                  href="/classroom"
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition active:scale-95 text-center"
                >
                  Go to Classroom ✓
                </Link>
              ) : (
                <Link
                  href={`/checkout/${course.id}`}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 text-center"
                >
                  Enroll Now →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-slate-200 gap-2 overflow-x-auto">
          {[
            { id: 'about', label: 'Course Overview' },
            { id: 'curriculum', label: 'Curriculum & Lectures' },
            { id: 'benefits', label: 'What You\'ll Learn' },
            { id: 'notes', label: 'Study Materials' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'about' && (
          <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm animate-fade-in">
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-900">Course Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                This course is meticulously designed to transform your academic confidence into peak exam performance.
                Taught directly by Bikash Chowdhury, the curriculum breaks down complex board theorems, numerical problems,
                and syllabus concepts into intuitive, easy-to-remember modules with real West Bengal exam focus.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t-2 border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Teaching Methodology</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                We utilize a 3-step learning loop: Conceptual Visual Explanations, Guided Problem Solving through standard board questions,
                and Exam Simulation with timed sectional tests and personalized doubt answering.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Curriculum Accordion */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Course Curriculum</h3>
              <span className="text-xs font-bold text-slate-500">4 Core Modules • 36+ Lectures</span>
            </div>

            {[
              {
                num: 1,
                title: 'Foundation & Core Concepts',
                lectures: '8 Lectures • 6.5 hrs',
                status: 'Unlocked Preview',
                items: [
                  'Introduction & Board Syllabus Breakdown',
                  'Core Formula Derivations & Fundamentals',
                  'Chapter Notes & Formula Sheet (PDF)',
                ]
              },
              {
                num: 2,
                title: 'Intermediate Problem Solving & Numericals',
                lectures: '10 Lectures • 8 hrs',
                status: isEnrolled ? 'Unlocked' : 'Locked',
                items: [
                  'Step-by-step NCERT & Board Model Question Solutions',
                  'Common Exam Pitfalls & Trap Avoidance',
                ]
              },
              {
                num: 3,
                title: 'Advanced Board Question Bank & Previous Years',
                lectures: '12 Lectures • 9.5 hrs',
                status: isEnrolled ? 'Unlocked' : 'Locked',
                items: [
                  'Past 10 Years Question Paper Solved',
                  'High-Yield Suggestion Topics for Final Exam',
                ]
              },
              {
                num: 4,
                title: 'Mock Tests & Final Revision Masterclass',
                lectures: '6 Lectures • 5 hrs',
                status: isEnrolled ? 'Unlocked' : 'Locked',
                items: [
                  'Timed Sectional Mock Test Paper',
                  'Full Answer Writing Guidelines & Review',
                ]
              }
            ].map((mod) => (
              <div key={mod.num} className="border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                      {mod.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{mod.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{mod.lectures}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${
                    mod.status.includes('Unlocked')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {mod.status}
                  </span>
                </div>

                <div className="pl-11 space-y-2 border-t border-slate-100 pt-3">
                  {mod.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="text-blue-500">▶</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Benefits */}
        {activeTab === 'benefits' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-lg font-black text-slate-900">What You'll Achieve</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                '100% syllabus coverage mapped to West Bengal Board guidelines',
                'Mastering long-answer scoring techniques and marking schemes',
                'Downloadable digital PDF revision notes for all chapters',
                'Direct live doubt solving sessions with Bikash Bhaiya',
                'Chapter-wise mock tests with rank and performance analysis',
                'Device synchronization across mobile app and web portal',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <span className="text-xs font-bold text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Study Notes */}
        {activeTab === 'notes' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-lg font-black text-slate-900">Study Materials & Notes</h3>
            <p className="text-xs text-slate-500 font-medium">
              High-yield summary notes, formula cheat sheets, and previous year solutions included with this course.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Chapter 1-4 Complete Revision Formula Sheet</h4>
                    <span className="text-xs text-slate-500">PDF • 22 Pages</span>
                  </div>
                </div>
                {isEnrolled ? (
                  <span className="text-xs font-black text-blue-600">Download Available in Classroom</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">🔒 Enrolled Students Only</span>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Sticky Bar (Matching Design Screenshot 2) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-4 py-3.5 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Course Fee</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">₹{Number(course.price).toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.youtube.com/@wbartsbyvikassir"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Watch Preview ▶
            </a>

            {isEnrolled ? (
              <Link
                href="/classroom"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95"
              >
                Access Course ✓
              </Link>
            ) : (
              <Link
                href={`/checkout/${course.id}`}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
              >
                Enroll Now →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
