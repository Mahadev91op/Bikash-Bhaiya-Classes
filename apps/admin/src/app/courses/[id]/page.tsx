'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import { db } from '../../../lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  orderBy, 
  addDoc, 
  setDoc,
  limit,
  onSnapshot 
} from 'firebase/firestore';

interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  expiresAt: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  notes?: string;
  createdAt?: any;
}

const formatImageUrl = (url: string) => {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
  return url;
};

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Manual Enroll states
  const [searchEmail, setSearchEmail] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');

  // Delete Course modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Remove Student modal
  const [studentToRemove, setStudentToRemove] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Coupons states
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [maxUses, setMaxUses] = useState<number>(50);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [couponNotes, setCouponNotes] = useState<string>('');
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const suggestionRef = useRef<HTMLDivElement>(null);

  const fetchCourseData = async () => {
    try {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCourse({ id: docSnap.id, ...data });
        setFormData({
          title: data.title || '', price: data.price || 0, duration: data.duration || '',
          description: data.description || '', class: data.class || '',
          subjects: (data.subjects || []).join(', '), imageUrl: data.imageUrl || ''
        });
      } else {
        router.push('/courses');
        return;
      }

      const studentsRef = collection(db, 'courses', courseId, 'enrolledStudents');
      const q = query(studentsRef, orderBy('enrolledAt', 'desc'));
      const studentSnap = await getDocs(q);
      setStudents(studentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCourseData(); 
  }, [courseId]);

  // Real-time listener for coupons subcollection
  useEffect(() => {
    if (!courseId) return;
    const couponsRef = collection(db, 'courses', courseId, 'coupons');
    const unsub = onSnapshot(couponsRef, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as CouponItem));
      // Sort: active first, then newest
      list.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));
      setCoupons(list);
    }, (err) => {
      console.warn('Coupons listener error:', err);
    });

    return () => unsub();
  }, [courseId]);

  // Outside click for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions for manual enroll
  useEffect(() => {
    if (!searchEmail || searchEmail.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const fetchSugg = async () => {
      try {
        const q = query(collection(db, 'users'), where('email', '>=', searchEmail.toLowerCase()), limit(10));
        const snap = await getDocs(q);
        const results = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((u: any) => u.email.includes(searchEmail.toLowerCase()));
        setSearchSuggestions(results);
      } catch (e) {}
    };
    const t = setTimeout(fetchSugg, 300);
    return () => clearTimeout(t);
  }, [searchEmail]);

  const handleUpdateControls = async (field: string, value: boolean) => {
    try {
      const updatedCourse = { ...course, [field]: value };
      setCourse(updatedCourse);
      await updateDoc(doc(db, 'courses', courseId), { [field]: value });
    } catch (err) {
      alert("Failed to update control.");
      setCourse(course);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formattedImageUrl = formatImageUrl(formData.imageUrl);
      const subjectsArray = formData.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      const updateData = {
        ...formData, 
        imageUrl: formattedImageUrl, 
        price: Number(formData.price),
        subjects: subjectsArray, 
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'courses', courseId), updateData);
      
      setCourse({ ...course, ...formData, imageUrl: formattedImageUrl, price: Number(formData.price), subjects: subjectsArray });
      setShowEditModal(false);
      fetchCourseData();
    } catch (err) {
      alert("Failed to update course.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate discount for selected coupon
  const activeSelectedCoupon = coupons.find(c => c.code === selectedCouponCode && c.isActive);
  let discountAmount = 0;
  if (activeSelectedCoupon && course?.price) {
    if (activeSelectedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((course.price * activeSelectedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(course.price, activeSelectedCoupon.discountValue);
    }
  }
  const finalPayablePrice = Math.max(0, (course?.price || 0) - discountAmount);

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError('');
    if (!searchEmail) return setEnrollError('Please enter a student email address.');
    
    setEnrollLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', searchEmail.toLowerCase().trim()));
      const userSnap = await getDocs(q);
      
      if (userSnap.empty) {
        setEnrollError('No registered student found with this email.');
        setEnrollLoading(false); 
        return;
      }
      
      const studentData = userSnap.docs[0].data();
      const studentId = userSnap.docs[0].id;

      const checkRef = doc(db, 'courses', courseId, 'enrolledStudents', studentId);
      const checkSnap = await getDoc(checkRef);
      if (checkSnap.exists()) {
        setEnrollError('This student is already enrolled in this course.');
        setEnrollLoading(false); 
        return;
      }

      await setDoc(checkRef, {
        studentId: studentId,
        name: studentData.name || 'Unknown',
        email: studentData.email || searchEmail,
        phone: studentData.phone || 'N/A',
        enrolledAt: serverTimestamp(),
        manual: true,
        couponApplied: activeSelectedCoupon ? activeSelectedCoupon.code : null,
        discountAmount: discountAmount,
        paidPrice: finalPayablePrice
      });

      // Increment coupon usage count if coupon applied
      if (activeSelectedCoupon) {
        const couponRef = doc(db, 'courses', courseId, 'coupons', activeSelectedCoupon.id);
        await updateDoc(couponRef, {
          usedCount: (activeSelectedCoupon.usedCount || 0) + 1
        });
      }

      // Send Notification to student
      await addDoc(collection(db, 'users', studentId, 'notifications'), {
        title: 'Course Enrolled! 🎉',
        message: `You have been granted access to "${course.title}". You can now access all learning materials!`,
        type: 'enrollment',
        courseId: courseId,
        createdAt: serverTimestamp(),
        read: false
      });

      const currentCount = course.enrolledCount || students.length;
      await updateDoc(doc(db, 'courses', courseId), { enrolledCount: currentCount + 1 });

      setSearchEmail('');
      setSelectedCouponCode('');
      setShowSuggestions(false);
      alert('Student successfully enrolled with real-time database sync!');
      fetchCourseData();
    } catch (err: any) {
      console.error(err);
      setEnrollError('Error during enrollment: ' + err.message);
    } finally {
      setEnrollLoading(false);
    }
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;
    setIsRemoving(true);
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'enrolledStudents', studentToRemove.id));
      
      const currentCount = Math.max(0, (course.enrolledCount || students.length) - 1);
      await updateDoc(doc(db, 'courses', courseId), { enrolledCount: currentCount });
      
      // Send notification to student
      await addDoc(collection(db, 'users', studentToRemove.studentId || studentToRemove.id, 'notifications'), {
        title: 'Course Access Removed',
        message: `Your access to the course "${course.title}" has been removed by the administrator.`,
        type: 'removal',
        courseId: courseId,
        createdAt: serverTimestamp(),
        read: false
      });

      setStudents(students.filter(s => s.id !== studentToRemove.id));
      setCourse({ ...course, enrolledCount: currentCount });
      setStudentToRemove(null);
    } catch (err) {
      alert("Failed to remove student from course.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      router.push('/courses');
    } catch (err) {
      alert("Failed to delete course.");
      setIsDeleting(false);
    }
  };

  // Coupons Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsCreatingCoupon(true);
    try {
      const cleanCode = couponCode.trim().toUpperCase();

      // Check if coupon already exists in this course
      if (coupons.some(c => c.code === cleanCode)) {
        alert(`Coupon code "${cleanCode}" already exists for this course.`);
        setIsCreatingCoupon(false);
        return;
      }

      const couponsRef = collection(db, 'courses', courseId, 'coupons');
      await addDoc(couponsRef, {
        code: cleanCode,
        courseId: courseId,
        courseTitle: course?.title || '',
        discountType: discountType,
        discountValue: Number(discountValue),
        maxUses: Number(maxUses) || 0,
        usedCount: 0,
        expiresAt: expiresAt || null,
        isActive: true,
        notes: couponNotes.trim(),
        createdAt: serverTimestamp()
      });

      setShowCouponModal(false);
      setCouponCode('');
      setDiscountValue(20);
      setMaxUses(50);
      setExpiresAt('');
      setCouponNotes('');
    } catch (err: any) {
      alert("Failed to create coupon: " + err.message);
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (c: CouponItem) => {
    try {
      const cRef = doc(db, 'courses', courseId, 'coupons', c.id);
      await updateDoc(cRef, { isActive: !c.isActive });
    } catch (err) {
      alert("Failed to toggle coupon status.");
    }
  };

  const handleDeleteCoupon = async (cId: string) => {
    if (!confirm("Are you sure you want to permanently delete this coupon code?")) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'coupons', cId));
    } catch (err) {
      alert("Failed to delete coupon.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoupon(text);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </DashboardLayout>
  );
  
  if (!course) return null;

  return (
    <DashboardLayout>
      {/* Top Breadcrumb & Action Banner */}
      <div className="mb-8 animate-fade-in-up">
        <button onClick={() => router.push('/courses')} className="flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors mb-6 group">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center mr-3 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </div>
          Back to Courses
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2rem] shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 relative overflow-hidden">
          {course.imageUrl && (
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
              <img src={course.imageUrl} className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to right, transparent, black)' }} referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-black text-blue-700 bg-blue-50 border-2 border-blue-200 px-4 py-1.5 rounded-full uppercase tracking-widest">{course.class || 'General'}</span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">Course ID: {courseId}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">{course.title}</h1>
            <p className="text-slate-600 font-medium text-base md:text-lg max-w-3xl leading-relaxed">{course.description}</p>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 bg-white border-2 border-slate-300 text-slate-800 hover:text-black px-6 py-3.5 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all active:scale-95 shrink-0 relative z-10"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Edit Course Details</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border-2 border-slate-300 ring-1 ring-slate-900/5 flex flex-col items-center justify-center text-center group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{course.enrolledCount || students.length}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Total Enrolled</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border-2 border-slate-300 ring-1 ring-slate-900/5 flex flex-col items-center justify-center text-center group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="text-emerald-700 font-black text-xl">₹</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{course.price}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Course Price</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border-2 border-slate-300 ring-1 ring-slate-900/5 flex flex-col items-center justify-center text-center group">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{course.duration}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Duration</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border-2 border-slate-300 ring-1 ring-slate-900/5 flex flex-col items-center justify-center text-center group">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-900">₹{(course.price * (course.enrolledCount || students.length)).toLocaleString()}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Est. Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Left Column (Controls, Coupons, Enrolled Students) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Controls */}
          <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 relative overflow-hidden">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center pb-3 border-b-2 border-slate-100">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Course Access & Visibility Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              <div className="flex items-center justify-between p-5 bg-slate-50 shadow-sm rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors border ${course.visibility ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">App Visibility</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Visible in course catalog.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUpdateControls('visibility', !course.visibility)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 border-2 ${course.visibility ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'}`}
                >
                  {course.visibility ? 'Active' : 'Hidden'}
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 shadow-sm rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors border ${course.enrollmentOpen ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Enrollment Gate</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Student admission status.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUpdateControls('enrollmentOpen', !course.enrollmentOpen)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 border-2 ${course.enrollmentOpen ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100' : 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100'}`}
                >
                  {course.enrollmentOpen ? 'Unlocked' : 'Locked'}
                </button>
              </div>
            </div>
          </div>

          {/* ADVANCE 🎟️ COUPONS & DISCOUNTS MANAGEMENT SECTION */}
          <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">Coupons & Discounts</h3>
                    <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                      {coupons.length} Configured
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage promotional codes, student usage quotas, and expiration dates in real time.</p>
                </div>
              </div>

              <button
                onClick={() => setShowCouponModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl shadow-md shadow-amber-500/20 text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 border border-amber-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                <span>+ Create Coupon Code</span>
              </button>
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
              {coupons.map((c) => {
                const isExpired = c.expiresAt ? new Date(c.expiresAt).getTime() < Date.now() : false;
                const isExhausted = c.maxUses > 0 && c.usedCount >= c.maxUses;
                const usagePercent = c.maxUses > 0 ? Math.min(100, (c.usedCount / c.maxUses) * 100) : 0;

                return (
                  <div 
                    key={c.id} 
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      !c.isActive || isExpired || isExhausted
                        ? 'bg-slate-50/80 border-slate-200 opacity-80'
                        : 'bg-white border-slate-300 hover:border-amber-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Ticket Badge */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 border-2 border-dashed border-amber-300 min-w-[90px] shrink-0">
                        <span className="text-lg font-black text-slate-900 font-mono tracking-wider">{c.code}</span>
                        <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest mt-0.5">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            title="Copy code"
                            className="inline-flex items-center text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            {copiedCoupon === c.code ? 'Copied!' : 'Copy Code'}
                          </button>

                          {c.isActive && !isExpired && !isExhausted && (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                              ACTIVE
                            </span>
                          )}
                          {!c.isActive && (
                            <span className="text-[10px] font-black bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full">
                              PAUSED
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                              EXPIRED
                            </span>
                          )}
                          {isExhausted && (
                            <span className="text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-300 px-2 py-0.5 rounded-full">
                              LIMIT REACHED
                            </span>
                          )}

                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span>🔒</span>
                            <span>Course Only</span>
                          </span>
                        </div>

                        {c.notes && (
                          <p className="text-xs text-slate-600 font-medium">{c.notes}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                          <span>
                            ⏳ {c.expiresAt ? `Valid until: ${new Date(c.expiresAt).toLocaleDateString()} ${new Date(c.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No Expiry Date (Lifetime)'}
                          </span>
                          <span>
                            👥 Usage: <strong>{c.usedCount}</strong> {c.maxUses > 0 ? `/ ${c.maxUses} students` : 'uses (Unlimited)'}
                          </span>
                        </div>

                        {/* Progress Bar for limited coupons */}
                        {c.maxUses > 0 && (
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden max-w-xs">
                            <div 
                              className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-rose-500' : 'bg-amber-500'}`}
                              style={{ width: `${usagePercent}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center pt-2 md:pt-0">
                      <button
                        onClick={() => handleToggleCoupon(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition ${
                          c.isActive
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {c.isActive ? 'Pause' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title="Delete coupon"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {coupons.length === 0 && (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No Active Coupons for this Course</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Create promotional coupon codes to give flat discounts or percentage savings to students upon admission.</p>
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    + Create First Coupon
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-900">Enrolled Students</h3>
                <span className="bg-blue-50 text-blue-700 border-2 border-blue-200 text-xs font-black px-3 py-1 rounded-full shadow-sm">{students.length}</span>
              </div>
              <div className="relative w-full sm:w-72">
                <svg className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Filter student..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-sm text-slate-900 font-bold transition-shadow" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs text-slate-400 font-black uppercase tracking-wider">
                    <th className="pb-4 px-2">Student Details</th>
                    <th className="pb-4 px-2">Enrollment Date</th>
                    <th className="pb-4 px-2">Pricing / Coupon</th>
                    <th className="pb-4 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{student.name}</span>
                          <span className="text-slate-500 text-xs mt-0.5">{student.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-slate-600 text-sm font-medium">{student.enrolledAt?.toDate ? student.enrolledAt.toDate().toLocaleDateString() : 'Just now'}</span>
                        {student.manual && <span className="ml-2 text-[9px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 uppercase tracking-widest">Manual</span>}
                      </td>
                      <td className="py-4 px-2">
                        {student.couponApplied ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block w-fit">
                              🎟️ {student.couponApplied} (-₹{student.discountAmount || 0})
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5">Paid: ₹{student.paidPrice || course.price}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-600">Standard (₹{course.price})</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button onClick={() => setStudentToRemove(student)} className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm border border-rose-200 hover:border-rose-600">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        <span className="font-medium">No students enrolled in this course yet.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Manual Enroll & System Info) */}
        <div className="space-y-8">
          
          {/* Manual Enroll with Coupon & Discount Option */}
          <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 overflow-visible relative">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              </div>
              Manual Student Enroll
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Directly enroll a registered student with optional coupon code discount.</p>
            
            <form onSubmit={handleManualEnroll} className="space-y-5">
              <div className="relative" ref={suggestionRef}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Student Email</label>
                <div className="relative z-20">
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <input required type="email" value={searchEmail} onChange={e => { setSearchEmail(e.target.value); setShowSuggestions(true); }} placeholder="student@example.com" className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-sm text-slate-900 font-bold transition-all shadow-sm" autoComplete="off" />
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-50 max-h-48 overflow-y-auto animate-fade-in-up">
                    {searchSuggestions.map((s, i) => (
                      <div key={i} onClick={() => { setSearchEmail(s.email); setShowSuggestions(false); }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700">{s.name || 'Student'}</span>
                          <span className="text-xs text-slate-500">{s.email}</span>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coupon Selection Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  <span>Apply Coupon Code (Optional)</span>
                  {activeSelectedCoupon && <span className="text-[10px] text-emerald-600 font-bold">Valid & Applied</span>}
                </label>
                <select
                  value={selectedCouponCode}
                  onChange={(e) => setSelectedCouponCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-sm text-slate-900 font-bold transition-all shadow-sm"
                >
                  <option value="">No Coupon (Standard Fee)</option>
                  {coupons
                    .filter(c => c.isActive && (!c.expiresAt || new Date(c.expiresAt).getTime() > Date.now()) && (c.maxUses === 0 || c.usedCount < c.maxUses))
                    .map(c => (
                      <option key={c.id} value={c.code}>
                        🎟️ {c.code} — {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              {/* Dynamic Pricing Breakdown */}
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-2 relative z-10">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Base Course Fee:</span>
                  <span>₹{course.price}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Coupon Discount ({selectedCouponCode}):</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">Payable Fee:</span>
                  <span className="text-2xl font-black text-slate-900">₹{finalPayablePrice}</span>
                </div>
              </div>

              {enrollError && (
                <div className="bg-rose-50 text-rose-700 text-xs font-bold p-3.5 rounded-xl border border-rose-200 flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>{enrollError}</span>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={enrollLoading} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center relative z-10"
              >
                {enrollLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Enrolling...</>
                ) : 'Confirm Student Enrollment'}
              </button>
            </form>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-5 pb-3 border-b-2 border-slate-100">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Database Metadata
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Document ID</p>
                <p className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 truncate select-all">{courseId}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Timestamp</p>
                <p className="text-xs font-mono text-slate-700 font-semibold">{course.updatedAt?.toDate ? course.updatedAt.toDate().toLocaleString() : (course.createdAt?.toDate ? course.createdAt.toDate().toLocaleString() : 'Live Sync')}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-slate-100">
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-xl border-2 border-rose-200 transition-all text-xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete Course
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl animate-fade-in-up border-2 border-amber-300 my-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Create Coupon Code</h2>
                  <p className="text-xs text-slate-500 font-medium">Add discount voucher for {course.title}</p>
                </div>
              </div>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Course Exclusive Lock Notice */}
            <div className="p-3.5 bg-amber-50/80 border-2 border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-950 font-semibold mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">🔒</span>
              <span>
                This coupon is strictly restricted to <strong>&quot;{course?.title}&quot;</strong>. Students will NOT be able to apply this coupon to any other course.
              </span>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Coupon Code (Uppercase)</label>
                <input 
                  required 
                  type="text" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                  placeholder="e.g. EARLYBIRD20 or FLAT500" 
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:border-amber-500 outline-none uppercase shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Discount Type</label>
                  <select 
                    value={discountType} 
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-amber-500 outline-none shadow-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Discount Value</label>
                  <input 
                    required 
                    type="number" 
                    min={1}
                    value={discountValue} 
                    onChange={e => setDiscountValue(Number(e.target.value))} 
                    placeholder="e.g. 20 or 500" 
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-amber-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Max Student Usage</label>
                  <input 
                    type="number" 
                    min={0}
                    value={maxUses} 
                    onChange={e => setMaxUses(Number(e.target.value))} 
                    placeholder="0 for Unlimited" 
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-amber-500 outline-none shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 = unlimited redemptions</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Expiry Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={expiresAt} 
                    onChange={e => setExpiresAt(e.target.value)} 
                    className="w-full px-3 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:border-amber-500 outline-none shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Optional (leave blank for lifetime)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Notes / Description (Optional)</label>
                <input 
                  type="text" 
                  value={couponNotes} 
                  onChange={e => setCouponNotes(e.target.value)} 
                  placeholder="e.g. Festive discount for first 50 students" 
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-slate-900 focus:border-amber-500 outline-none shadow-sm text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t-2 border-slate-100">
                <button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 py-3 text-slate-600 hover:text-slate-900 font-bold rounded-xl transition text-sm">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isCreatingCoupon || !couponCode.trim()} 
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition text-sm disabled:opacity-50"
                >
                  {isCreatingCoupon ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE DETAILS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl my-auto animate-fade-in-up overflow-hidden border-2 border-slate-200 flex flex-col md:flex-row relative">
            <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                <h2 className="text-2xl font-black mb-2">Edit Course Details</h2>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">Update curriculum and pricing. Changes reflect immediately on student portal and mobile apps.</p>
              </div>

              <div className="hidden md:block relative z-10 mt-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Preview</p>
                  <h4 className="font-bold text-white line-clamp-1">{formData.title || 'Course Title'}</h4>
                  <p className="text-lg font-black text-emerald-400 mt-1">₹{formData.price || '0'}</p>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 bg-white p-8 relative">
              <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 w-9 h-9 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full flex items-center justify-center transition-all text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Course Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 transition-all font-bold text-sm shadow-sm" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price (₹)</label>
                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 transition-all font-bold text-sm shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Duration</label>
                    <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 transition-all font-bold text-sm shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Class</label>
                    <input required type="text" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 transition-all font-bold text-sm shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Subjects</label>
                    <input required type="text" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 transition-all font-bold text-sm shadow-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Banner Image URL</label>
                  <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 transition-all font-bold text-sm shadow-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none text-slate-900 resize-none transition-all font-medium text-sm shadow-sm"></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t-2 border-slate-100">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-bold rounded-xl transition text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 text-sm">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE STUDENT CONFIRMATION MODAL */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up border-2 border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Remove Student Access</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to remove <strong>{studentToRemove.name}</strong> from &quot;{course.title}&quot;? They will immediately lose access to all lectures and study materials.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStudentToRemove(null)} className="flex-1 py-3 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-sm">Cancel</button>
              <button 
                onClick={confirmRemoveStudent} 
                disabled={isRemoving}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
              >
                {isRemoving ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE COURSE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up border-2 border-rose-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Entire Course</h3>
            <p className="text-sm text-slate-600 mb-6">
              This action will permanently delete <strong>{course.title}</strong> and revoke student access. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-sm">Cancel</button>
              <button 
                onClick={handleDeleteCourse} 
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </DashboardLayout>
  );
}
