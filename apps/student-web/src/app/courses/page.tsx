'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=800&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  }
  return url;
};

export default function CoursesExplorerPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'courses'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(list);

        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const uData = userDoc.data() || {};
          const eIds = new Set<string>(uData.enrolledCourses || []);

          // Also check enrolledStudents subcollections
          for (const c of list) {
            try {
              const subSnap = await getDoc(doc(db, 'courses', c.id, 'enrolledStudents', user.uid));
              if (subSnap.exists()) {
                eIds.add(c.id);
              }
            } catch (e) {}
          }
          setEnrolledCourseIds(Array.from(eIds));
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Extract unique filters from courses in DB
  const filterOptions = useMemo(() => {
    const filters = new Set<string>(['All']);
    courses.forEach(c => {
      if (c.class) filters.add(c.class.trim());
      if (Array.isArray(c.subjects)) {
        c.subjects.forEach((s: string) => {
          if (s) filters.add(s.trim());
        });
      }
    });
    return Array.from(filters);
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch =
        searchQuery === '' ||
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.class || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(c.subjects) && c.subjects.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchFilter =
        selectedFilter === 'All' ||
        c.class === selectedFilter ||
        (Array.isArray(c.subjects) && c.subjects.includes(selectedFilter));

      return matchSearch && matchFilter;
    });
  }, [courses, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header & Search */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Courses</h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                Find the right course to master your board exams with conceptual clarity.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, subjects, or classes..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterOptions.map((filter) => {
              const active = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-xs ${
                    active
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-200'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Bundle Banner (Matching Design Screenshot 3) */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 border-2 border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-white/20 text-white backdrop-blur-md">
              ⚡ Special Bundle Offer • Limited Time
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Master All West Bengal Board Subjects with Bikash Bhaiya
            </h2>
            <p className="text-blue-100 text-sm font-medium">
              Get access to all batch lectures, digital PDF notes, and live doubt clearing sessions with 1-on-1 mentorship.
            </p>
          </div>
          <a
            href="https://wa.me/916290325241?text=Hello%20Bikash%20Bhaiya%2C%20I%20want%20to%20enroll%20in%20the%20Special%20Batch%20Program"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-black text-sm rounded-xl shadow-lg transition active:scale-95 whitespace-nowrap shrink-0"
          >
            Claim Special Offer →
          </a>
        </section>

        {/* Courses Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">
              Available Courses ({filteredCourses.length})
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-white rounded-2xl border-2 border-slate-200 animate-pulse p-4 space-y-4">
                  <div className="h-44 bg-slate-200 rounded-xl" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300 space-y-4">
              <div className="text-4xl">🔍</div>
              <h4 className="text-xl font-black text-slate-800">No courses found</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No courses match your search "{searchQuery}" or selected filter "{selectedFilter}".
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedFilter('All'); }}
                className="px-5 py-2.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Course Banner */}
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={formatImageUrl(course.imageUrl)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-slate-900 shadow-sm border border-slate-200">
                        {course.class || 'All Classes'}
                      </div>
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                        ₹{Number(course.price).toLocaleString()}
                      </div>
                    </div>

                    {/* Course Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1 text-amber-500 font-black">
                            ★ 4.9 <span className="text-slate-400 font-medium">({course.enrolledCount || 20}+ enrolled)</span>
                          </span>
                          <span>{course.duration || 'Full Academic Year'}</span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                          {course.description || 'Structured conceptual lectures mapped to latest West Bengal board syllabus with chapter tests.'}
                        </p>

                        {/* Subject Badges */}
                        {Array.isArray(course.subjects) && course.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {course.subjects.map((sub: string, idx: number) => (
                              <span key={idx} className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Price & Action */}
                      <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fee</span>
                          <span className="text-lg font-black text-slate-900">
                            ₹{Number(course.price).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/courses/${course.id}`}
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition"
                          >
                            Details
                          </Link>

                          {isEnrolled ? (
                            <Link
                              href="/classroom"
                              className="px-4 py-2.5 bg-emerald-50 text-emerald-700 font-black text-xs rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                            >
                              ✓ Classroom
                            </Link>
                          ) : (
                            <Link
                              href={`/checkout/${course.id}`}
                              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
                            >
                              Enroll Now
                            </Link>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
