'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, query, where, getDocs, deleteDoc, collection, addDoc, serverTimestamp, setDoc, deleteField } from 'firebase/firestore';

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExitCourseModal, setShowExitCourseModal] = useState<any | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrollCouponCode, setEnrollCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Form Data with canonical field names (schoolName, className)
  const [formData, setFormData] = useState({ phone: '', schoolName: '', className: '' });
  const [newPassword, setNewPassword] = useState('');

  const fetchData = async () => {
    try {
      const docRef = doc(db, 'users', studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentSchoolName = data.schoolName || data.school || '';
        const currentClassName = data.className || data.class || '';
        setStudent({ 
          id: snap.id, 
          ...data, 
          schoolName: currentSchoolName, 
          className: currentClassName 
        });
        setFormData({ 
          phone: data.phone || '', 
          schoolName: currentSchoolName, 
          className: currentClassName 
        });
      } else {
        router.push('/students');
        return;
      }

      // Fetch all courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const allCourseList = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableCourses(allCourseList);
      
      const enrolledList: any[] = [];
      await Promise.all(coursesSnap.docs.map(async (cDoc) => {
        try {
          // Direct document lookup by studentId (fastest & standard pattern)
          const directRef = doc(db, 'courses', cDoc.id, 'enrolledStudents', studentId);
          const directSnap = await getDoc(directRef);
          if (directSnap.exists()) {
            enrolledList.push({
              enrollmentId: directSnap.id,
              courseId: cDoc.id,
              enrolledAt: directSnap.data().enrolledAt,
              ...cDoc.data()
            });
            return;
          }

          // Single collection query fallback in case doc id is an auto-generated id
          const q = query(collection(db, 'courses', cDoc.id, 'enrolledStudents'), where('studentId', '==', studentId));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const d = qSnap.docs[0];
            enrolledList.push({
              enrollmentId: d.id,
              courseId: cDoc.id,
              enrolledAt: d.data().enrolledAt,
              ...cDoc.data()
            });
          }
        } catch (e) {
          console.warn(`Error checking enrollment for course ${cDoc.id}:`, e);
        }
      }));

      // Sort courses by enrolled date
      enrolledList.sort((a, b) => {
        const aTime = a.enrolledAt?.toMillis ? a.enrolledAt.toMillis() : 0;
        const bTime = b.enrolledAt?.toMillis ? b.enrolledAt.toMillis() : 0;
        return bTime - aTime;
      });

      setCourses(enrolledList);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [studentId]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update canonical fields and delete legacy redundant fields (school, class)
      await updateDoc(doc(db, 'users', studentId), {
        phone: formData.phone,
        schoolName: formData.schoolName,
        className: formData.className,
        school: deleteField(),
        class: deleteField()
      });
      setStudent({ 
        ...student, 
        phone: formData.phone, 
        schoolName: formData.schoolName, 
        className: formData.className,
        school: undefined,
        class: undefined
      });
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to update.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
    setIsResetting(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetPassword', newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Password reset successfully!\nA notification has been sent to the student.`);
        setShowResetPasswordModal(false);
        setNewPassword('');
      } else throw new Error(data.error);
    } catch (err: any) {
      alert("Error resetting password: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = student.status === 'suspended' ? 'active' : 'suspended';
    setIsChangingStatus(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setStudent({ ...student, status: newStatus });
      } else throw new Error(data.error);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteAccount' })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/students');
      } else throw new Error(data.error);
    } catch (err: any) {
      alert("Error deleting account: " + err.message);
      setIsDeleting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!selectedCourseId) {
      setCouponError('Please select a course first.');
      return;
    }
    if (!enrollCouponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          code: enrollCouponCode.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || 'Invalid coupon code for this course.');
      }
    } catch (err: any) {
      setCouponError('Error validating coupon. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleEnrollCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setIsEnrolling(true);
    try {
      const cRef = doc(db, 'courses', selectedCourseId);
      const cSnap = await getDoc(cRef);
      if (!cSnap.exists()) {
        alert("Course not found.");
        return;
      }
      const courseData = cSnap.data();

      // Calculate final fee with applied coupon
      const originalPrice = Number(courseData.price || 0);
      let discountAmt = 0;
      if (appliedCoupon && originalPrice > 0) {
        if (appliedCoupon.discountType === 'percentage') {
          discountAmt = Math.round((originalPrice * appliedCoupon.discountValue) / 100);
        } else {
          discountAmt = Math.min(originalPrice, appliedCoupon.discountValue);
        }
      }
      const finalPrice = Math.max(0, originalPrice - discountAmt);

      const enrollRef = doc(db, 'courses', selectedCourseId, 'enrolledStudents', studentId);
      await setDoc(enrollRef, {
        studentId: studentId,
        name: student?.name || 'Unknown',
        email: student?.email || '',
        phone: student?.phone || 'N/A',
        enrolledAt: serverTimestamp(),
        manual: true,
        couponApplied: appliedCoupon ? appliedCoupon.code : null,
        originalPrice: originalPrice,
        discountAmount: discountAmt,
        finalPrice: finalPrice
      });

      // Update enrolled count in course
      const count = courseData.enrolledCount || 0;
      await updateDoc(cRef, { enrolledCount: count + 1 });

      // If coupon used, increment its usage count inside that course's subcollection
      if (appliedCoupon?.id) {
        try {
          const couponDocRef = doc(db, 'courses', selectedCourseId, 'coupons', appliedCoupon.id);
          await updateDoc(couponDocRef, {
            usedCount: (appliedCoupon.usedCount || 0) + 1
          });
        } catch (couponErr) {
          console.warn('Coupon usage update error:', couponErr);
        }
      }

      // Send notification to student
      await addDoc(collection(db, 'users', studentId, 'notifications'), {
        title: 'Course Enrolled! 🎉',
        message: `You have been enrolled in "${courseData.title}". ${appliedCoupon ? `(Coupon ${appliedCoupon.code} applied)` : ''}`,
        type: 'enrollment',
        courseId: selectedCourseId,
        createdAt: serverTimestamp(),
        read: false
      });

      setShowEnrollModal(false);
      setSelectedCourseId('');
      setEnrollCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Error enrolling student: " + err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleExitCourse = async (courseId: string, enrollmentId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'enrolledStudents', enrollmentId));
      
      const cRef = doc(db, 'courses', courseId);
      const cSnap = await getDoc(cRef);
      if (cSnap.exists()) {
        const count = cSnap.data().enrolledCount || 1;
        await updateDoc(cRef, { enrolledCount: Math.max(0, count - 1) });
      }

      await addDoc(collection(db, 'users', studentId, 'notifications'), {
        title: 'Course Exit',
        message: 'Your access to a course was removed by the administrator.',
        type: 'removal',
        createdAt: serverTimestamp(),
        read: false
      });

      setCourses(courses.filter(c => c.courseId !== courseId));
      setShowExitCourseModal(null);
    } catch (err) {
      alert("Error removing from course.");
    }
  };

  if (loading) return <DashboardLayout><div className="flex h-[80vh] items-center justify-center"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div></DashboardLayout>;
  if (!student) return null;

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push('/students')} className="flex items-center text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mr-3 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            Back to Students
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowResetPasswordModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 font-bold text-sm transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Reset Password
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 font-bold text-sm transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Edit Details
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex items-center border border-blue-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl translate-y-1/2"></div>
          
          <div className="w-24 h-24 rounded-2xl bg-white text-blue-700 font-black text-4xl flex items-center justify-center shadow-lg shrink-0 mr-6 relative z-10 border-4 border-white/20">
            {(student.name || 'S').substring(0, 2).toUpperCase()}
          </div>
          <div className="text-white relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black tracking-tight">{student.name}</h1>
              <span className="text-[10px] font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest border border-white/30 backdrop-blur-sm shadow-sm">Student</span>
            </div>
            <div className="flex items-center gap-6 text-blue-100 text-sm mt-3 font-medium">
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>{student.email}</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>Joined {student.createdAt?.toDate ? student.createdAt.toDate().toLocaleDateString() : (typeof student.createdAt === 'string' ? new Date(student.createdAt).toLocaleDateString() : 'Via App')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Personal Info */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 hover:border-slate-400 transition-all">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-100">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Personal Details & Academic Profile
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Verified Profile</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/80 shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>Phone Number</p>
              <p className="font-extrabold text-slate-900 text-lg">{student.phone || <span className="text-slate-400 italic">Not Provided</span>}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/80 shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>School Name</p>
              <p className="font-extrabold text-slate-900 text-lg">{student.schoolName || student.school || <span className="text-slate-400 italic">Not Provided</span>}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/80 shadow-inner md:col-span-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><span className="font-bold text-blue-500">#</span> Class / Grade Level</p>
              <p className="font-extrabold text-slate-900 text-lg">{student.className || student.class || <span className="text-slate-400 italic">Not Provided</span>}</p>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 flex flex-col justify-between hover:border-slate-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-100">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Account Status</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Control</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${student.status === 'suspended' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Account Status</span>
                  <span className="text-xs text-slate-500">{student.status === 'suspended' ? 'Login Blocked' : 'Active Access'}</span>
                </div>
              </div>
              <button 
                onClick={handleToggleStatus}
                disabled={isChangingStatus}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border-2 ${student.status === 'suspended' ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'}`}
              >
                {isChangingStatus ? 'Updating...' : (student.status === 'suspended' ? 'Suspended' : 'Active')}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-slate-100">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3.5 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Delete Student Account
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-[2rem] p-8 shadow-md border-2 border-slate-300 ring-1 ring-slate-900/5 animate-fade-in-up hover:border-slate-400 transition-all" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Enrolled Courses & Academic Subscriptions
            </h3>
            <span className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-3 py-0.5 rounded-full text-xs font-black shadow-sm">{courses.length} Active</span>
          </div>

          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            + Enroll in Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.courseId} className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-lg transition-all group relative bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between">
              <div>
                {course.imageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <h4 className="font-bold text-slate-900 line-clamp-2 mb-2 pr-8 text-base">{course.title}</h4>
                {course.duration && <p className="text-xs text-slate-500 mb-3 font-medium">Duration: {course.duration}</p>}
              </div>

              <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t-2 border-slate-100">
                <span className="text-slate-600 font-bold bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">Class {course.class || 'Gen'}</span>
                <span className="font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">₹{course.price}</span>
              </div>

              <button 
                onClick={() => setShowExitCourseModal(course)}
                className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-slate-200 hover:border-rose-300 z-10"
                title="Remove from course"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <p className="font-bold text-gray-600 mb-1">Not enrolled in any courses</p>
              <p className="text-xs text-gray-400 mb-4">Click &quot;Enroll in Course&quot; above to grant this student access to a course.</p>
              <button 
                onClick={() => setShowEnrollModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                Enroll Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enroll in Course Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl animate-fade-in-up border-2 border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Enroll in Course</h2>
                  <p className="text-xs text-gray-400 font-medium">Select a course to enroll {student.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleEnrollCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Course</label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {availableCourses
                    .filter(ac => !courses.some(c => c.courseId === ac.id))
                    .map(ac => (
                      <label 
                        key={ac.id} 
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedCourseId === ac.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="selectedCourse" 
                            value={ac.id} 
                            checked={selectedCourseId === ac.id} 
                            onChange={() => {
                              if (selectedCourseId !== ac.id) {
                                setSelectedCourseId(ac.id);
                                setAppliedCoupon(null);
                                setEnrollCouponCode('');
                                setCouponError('');
                              }
                            }} 
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{ac.title}</p>
                            <p className="text-xs text-gray-400 font-medium">Class {ac.class || 'All'} • ₹{ac.price}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg border border-gray-200 text-gray-600">{ac.duration || 'Flexible'}</span>
                      </label>
                    ))}
                  {availableCourses.filter(ac => !courses.some(c => c.courseId === ac.id)).length === 0 && (
                    <p className="text-center py-6 text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      Student is already enrolled in all available courses.
                    </p>
                  )}
                </div>
              </div>

              {/* Course-Specific Coupon Input */}
              {selectedCourseId && (
                <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎟️</span>
                      <span>Coupon Code (Optional)</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Course-Locked Only
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={enrollCouponCode}
                      onChange={e => {
                        setEnrollCouponCode(e.target.value.toUpperCase());
                        if (couponError) setCouponError('');
                      }}
                      placeholder="Enter coupon for this course"
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-mono font-bold text-xs uppercase text-slate-900 focus:border-blue-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !enrollCouponCode.trim()}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 shrink-0"
                    >
                      {isValidatingCoupon ? 'Checking...' : 'Apply Code'}
                    </button>
                  </div>

                  {/* Error display (e.g. if code belongs to another course) */}
                  {couponError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                      <span className="text-sm shrink-0">⚠️</span>
                      <span>{couponError}</span>
                    </div>
                  )}

                  {/* Success display */}
                  {appliedCoupon && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎉</span>
                        <span>
                          Coupon <strong>{appliedCoupon.code}</strong> applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setEnrollCouponCode('');
                        }}
                        className="text-emerald-700 hover:text-emerald-900 underline text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {(() => {
                    const selCourse = availableCourses.find(c => c.id === selectedCourseId);
                    const origPrice = Number(selCourse?.price || 0);
                    let discount = 0;
                    if (appliedCoupon && origPrice > 0) {
                      if (appliedCoupon.discountType === 'percentage') {
                        discount = Math.round((origPrice * appliedCoupon.discountValue) / 100);
                      } else {
                        discount = Math.min(origPrice, appliedCoupon.discountValue);
                      }
                    }
                    const payable = Math.max(0, origPrice - discount);

                    return (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">
                          Original: <span className={discount > 0 ? 'line-through text-slate-400' : 'text-slate-700'}>₹{origPrice}</span>
                          {discount > 0 && <span className="text-emerald-600 ml-2">-₹{discount}</span>}
                        </span>
                        <span className="text-slate-900 text-sm">
                          Payable: <strong className="text-blue-600 text-base">₹{payable}</strong>
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="pt-4 flex gap-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEnrollModal(false)} className="flex-1 py-3 text-gray-500 hover:text-gray-900 font-bold rounded-xl transition-colors text-sm">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isEnrolling || !selectedCourseId} 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isEnrolling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up border-2 border-blue-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Edit Student
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-bold transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">School Name</label>
                <input type="text" value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-bold transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Class Level</label>
                <input type="text" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-bold transition-all shadow-sm" />
              </div>
              <div className="pt-6 flex gap-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3.5 text-gray-500 hover:text-gray-900 font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">{isSaving ? 'Saving...' : 'Save Details'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up border-2 border-orange-100">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 border border-orange-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Reset Password</h3>
            <p className="text-gray-500 font-medium mb-6 text-sm">Enter a new secure password for this student. They will receive a notification.</p>
            
            <form onSubmit={handleResetPassword}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                <input required minLength={6} type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white outline-none text-gray-900 font-bold transition-all shadow-sm" />
              </div>
              
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowResetPasswordModal(false)} className="flex-1 py-3.5 bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={isResetting} className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center">
                  {isResetting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up text-center border-2 border-red-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-gray-500 font-medium mb-8">This action is permanent and cannot be reversed. This student will be completely removed from the platform.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors hover:bg-gray-100">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all">{isDeleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Course Modal */}
      {showExitCourseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in-up text-center border-2 border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Remove from Course?</h3>
            <p className="text-gray-500 font-medium mb-8">Are you sure you want to remove this student from <strong className="text-gray-800">{(showExitCourseModal as any).title}</strong>?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowExitCourseModal(null)} className="flex-1 py-3.5 bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleExitCourse((showExitCourseModal as any).courseId, (showExitCourseModal as any).enrollmentId)} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all">Remove Access</button>
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
