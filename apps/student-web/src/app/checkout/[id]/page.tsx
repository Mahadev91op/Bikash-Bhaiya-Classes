'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=800&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  }
  return url;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const { user, student, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout/${courseId}`);
      return;
    }

    if (!courseId) return;

    const fetchCourse = async () => {
      setLoadingCourse(true);
      try {
        const cRef = doc(db, 'courses', courseId);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          setCourse({ id: cSnap.id, ...cSnap.data() });
        } else {
          router.push('/courses');
        }
      } catch (err) {
        console.error('Error fetching checkout course:', err);
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourse();
  }, [courseId, user, authLoading, router]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          courseId: courseId,
          basePrice: Number(course.price || 0)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
  };

  // Calculations
  const basePrice = Number(course?.price || 0);
  const originalDisplayPrice = Math.round(basePrice * 1.5);
  const baseDiscount = originalDisplayPrice - basePrice;
  const couponDiscount = appliedCoupon?.discountAmount ? Number(appliedCoupon.discountAmount) : 0;
  const finalPayable = Math.max(0, basePrice - couponDiscount);

  const handleProceedToPay = async () => {
    if (!agreeTerms) {
      alert('Please agree to the Terms & Conditions to continue.');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          studentId: user.uid,
          couponCode: appliedCoupon?.code || null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Enrollment could not be completed.');
        setIsProcessing(false);
        return;
      }

      setEnrollSuccess(true);
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'Payment processing failed.');
      setIsProcessing(false);
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-500">Preparing secure checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <Navbar />

      {/* Enrollment Celebration Modal */}
      {enrollSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center border-2 border-emerald-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Enrollment Confirmed!
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-3 mb-2">
              Welcome to the Course!
            </h3>
            <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed">
              You are now officially enrolled in <strong>{course.title}</strong>. All video lectures, test papers, and PDF notes are ready in your classroom.
            </p>
            <button
              type="button"
              onClick={() => router.push('/classroom')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 text-sm"
            >
              Go to My Classroom →
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 bg-white rounded-xl border-2 border-slate-200 hover:bg-slate-100 transition text-slate-600 font-bold"
          >
            ←
          </button>
          <h1 className="text-2xl font-black text-slate-900">Checkout & Enrollment</h1>
        </div>

        {/* Course Summary Card (Matching Design Screenshot 6) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-36 h-24 rounded-2xl bg-slate-900 overflow-hidden relative shrink-0">
              <img
                src={formatImageUrl(course.imageUrl)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                {course.class || 'Board Course'}
              </span>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                BIKASH BHAIYA CLASSES
              </span>
              <h2 className="text-base font-black text-slate-900 line-clamp-1">
                {course.title}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-500 font-semibold">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  B
                </span>
                <span>Bikash Chowdhury • Lead Educator</span>
              </div>
            </div>
          </div>
        </section>

        {/* Have a Coupon Code Box (Matching Design Screenshot 6) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900">Have a Coupon Code?</h3>
          
          <form onSubmit={handleApplyCoupon} className="flex gap-2.5">
            <input
              type="text"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter coupon (e.g. SAVE50)"
              disabled={!!appliedCoupon || couponLoading}
              className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black tracking-wider text-slate-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="px-5 py-3 bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200 font-black text-xs rounded-xl transition"
              >
                Remove
              </button>
            ) : (
              <button
                type="submit"
                disabled={couponLoading || !couponCodeInput.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            )}
          </form>

          {appliedCoupon && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-between text-xs font-black text-emerald-800">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Coupon "{appliedCoupon.code}" applied! You saved ₹{couponDiscount.toLocaleString()}.</span>
              </div>
              <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded-md">
                {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
              </span>
            </div>
          )}

          {couponError && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>{couponError}</span>
            </div>
          )}
        </section>

        {/* Price Details Box (Matching Design Screenshot 6) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900">Price Details</h3>
          
          <div className="space-y-2 text-xs font-bold text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Course Original Price</span>
              <span>₹{originalDisplayPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-black">
              <span>Batch Special Discount</span>
              <span>-₹{baseDiscount.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-blue-600 font-black">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>-₹{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-3 border-t-2 border-slate-100 flex justify-between text-base font-black text-slate-900">
              <span>Total Payable Amount</span>
              <span className="text-blue-600">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Select Payment Method (Matching Design Screenshot 6) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900">Select Payment Method</h3>

          <div className="space-y-2 pt-1">
            {[
              { id: 'upi', title: 'UPI / Google Pay / PhonePe', desc: 'Instant activation via any UPI app', icon: '⚡' },
              { id: 'card', title: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay & more', icon: '💳' },
              { id: 'netbanking', title: 'Net Banking', desc: 'All major Indian banks supported', icon: '🏦' },
            ].map((method) => {
              const selected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                    selected ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-xs">
                      {method.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{method.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{method.desc}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {selected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security & Terms */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 text-center">
            <span className="text-emerald-600 font-black">🛡 256-bit SSL Encrypted</span>
            <span>•</span>
            <span>100% Secure Payment Guarantee</span>
          </div>

          <label className="flex items-start gap-3 cursor-pointer text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>
              I agree to the Terms & Conditions and Privacy Policy of Bikash Bhaiya Classes.
            </span>
          </label>
        </div>

        {/* Bottom Payable & Action */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{finalPayable.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedToPay}
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Activating Enrollment...' : 'Proceed to Pay 🔒'}
          </button>
        </div>

      </main>
    </div>
  );
}
