'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const formatImageUrl = (url: string) => {
  if (!url) return '';
  
  console.log("Original Image URL:", url);
  // Extract ID from Google Drive URLs
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const newUrl = `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
    console.log("Converted Google Drive URL:", newUrl);
    return newUrl;
  }
  
  console.log("Keeping original URL:", url);
  return url;
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', duration: '', description: '', 
    class: '', subjects: '', imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedImageUrl = formatImageUrl(formData.imageUrl);
      const subjectsArray = formData.subjects.split(',').map(s => s.trim()).filter(s => s);
      await addDoc(collection(db, 'courses'), {
        ...formData,
        imageUrl: formattedImageUrl,
        price: Number(formData.price),
        subjects: subjectsArray,
        visibility: true,
        enrollmentOpen: true,
        enrolledCount: 0,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setFormData({ title: '', price: '', duration: '', description: '', class: '', subjects: '', imageUrl: '' });
      fetchCourses();
    } catch (err) {
      console.error("Error creating course", err);
      alert("Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.class && String(c.class).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight mb-2">Manage Courses</h1>
          <p className="text-gray-500 font-medium">Create and oversee your premium curriculum.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[320px] group">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search by title or class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 font-bold shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all active:scale-95 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            <span>Create Course</span>
          </button>
        </div>
      </header>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-32 animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="w-full bg-white border-2 border-slate-300 rounded-[2rem] p-16 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Found</h3>
          <p className="text-gray-500 font-medium">Create your first course to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, idx) => (
            <div 
              key={course.id} 
              onClick={() => router.push(`/courses/${course.id}`)}
              className="bg-white rounded-[2rem] shadow-md hover:shadow-2xl border-2 border-slate-300 hover:border-blue-500 overflow-hidden transition-all duration-300 cursor-pointer group flex flex-col hover:-translate-y-2 animate-fade-in-up relative z-10"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="h-56 bg-gray-100 relative overflow-hidden">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-sm font-medium">No Banner Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {!course.visibility && (
                  <div className="absolute top-4 left-4 bg-gray-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm">
                    HIDDEN
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/95 text-blue-700 text-xs font-black px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
                  {course.class || 'All Classes'}
                </div>
              </div>
              <div className="p-7 flex flex-col flex-1 relative bg-white">
                <div className="absolute top-0 right-7 -mt-6 bg-green-500 text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg border-2 border-white">
                  ₹{course.price}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 pr-12 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{course.description}</p>
                
                <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-auto">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    {course.enrolledCount || 0} Students
                  </span>
                  <span className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wide flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {course.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-4xl my-auto animate-fade-in-up overflow-hidden border border-white/20 flex flex-col md:flex-row relative">
            
            {/* Left Side: Gradient Banner Info */}
            <div className="md:w-1/3 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h2 className="text-3xl font-black mb-3">Create New Course</h2>
                <p className="text-blue-200 text-sm font-medium leading-relaxed">Launch a premium curriculum. Ensure all details are accurate before publishing to students.</p>
              </div>

              <div className="hidden md:block relative z-10">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Live Preview</p>
                  <h4 className="font-bold text-white line-clamp-1">{formData.title || 'Course Title'}</h4>
                  <p className="text-xl font-black text-white mt-1">₹{formData.price || '0'}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-2/3 bg-white p-8 sm:p-10 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center transition-all text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <form onSubmit={handleCreateCourse} className="space-y-6 mt-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Title</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full pl-12 pr-5 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 transition-all font-bold" placeholder="Masterclass: Physics for Class 12" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors font-black text-lg">₹</div>
                      <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full pl-9 pr-5 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 transition-all font-bold" placeholder="999" />
                    </div>
                  </div>
                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full pl-12 pr-5 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 transition-all font-bold" placeholder="6 Months" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Target Class */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Class</label>
                    <input required type="text" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 transition-all font-bold" placeholder="Class 12" />
                  </div>
                  {/* Subjects */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subjects (Comma separated)</label>
                    <input required type="text" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 transition-all font-bold" placeholder="Physics, Chemistry" />
                  </div>
                </div>

                {/* Image URL & Preview */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Banner Image URL</label>
                  <div className="relative group mb-3">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full pl-12 pr-5 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 transition-all font-bold" placeholder="https://drive.google.com/..." />
                  </div>
                  {formData.imageUrl ? (
                    <div className="h-32 w-full rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-100 relative group">
                      {/* HARD DEBUGGING OVERLAY */}
                      <div className="absolute top-0 left-0 bg-black/80 text-white text-[8px] p-1 z-20 break-all w-full">{formatImageUrl(formData.imageUrl)}</div>
                      <img src={formatImageUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <span className="text-xs font-bold">Image Preview</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-gray-900 resize-none transition-all font-bold" placeholder="Detail out the curriculum..."></textarea>
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 text-gray-500 hover:text-gray-900 font-bold rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 flex items-center">
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Creating...</>
                    ) : 'Publish Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </DashboardLayout>
  );
}
