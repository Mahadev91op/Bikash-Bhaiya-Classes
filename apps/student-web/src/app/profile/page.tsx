'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Flame, BookOpen, Award, Target, Smartphone, MessageCircle, ShieldCheck, LogOut, Edit3, GraduationCap, ArrowRight, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, student, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [className, setClassName] = useState('12');
  const [schoolName, setSchoolName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setPhone(student.phone || '');
      setClassName(student.className || '12');
      setSchoolName(student.schoolName || '');
    }
  }, [student]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        phone: phone.trim(),
        className: className.trim(),
        schoolName: schoolName.trim(),
      });
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const enrolledCount = student?.enrolledCourses?.length || 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-xs font-black text-emerald-800 flex items-center justify-between animate-fade-in">
            <span>✓ Profile updated successfully in real-time!</span>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-600">✕</button>
          </div>
        )}

        {/* Profile Card (Matching Design Screenshot 5) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden space-y-4">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 absolute top-0 left-0 right-0" />
          
          <div className="relative pt-6">
            <div className="w-24 h-24 rounded-full bg-blue-700 text-white font-black text-3xl flex items-center justify-center mx-auto border-4 border-white shadow-lg">
              {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900">
              {student?.name || (user?.email ? user.email.split('@')[0] : 'Student')}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              {student?.email || user?.email} • {student?.phone ? `+91 ${student.phone}` : 'No phone linked'}
            </p>
            <div className="pt-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                <GraduationCap className="w-3.5 h-3.5" /> Class {student?.className || '12'} • West Bengal Board • Batch 2024-26
              </span>
            </div>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile Details
            </button>
          ) : (
            <form onSubmit={handleSaveProfile} className="pt-4 border-t-2 border-slate-100 space-y-3 text-left">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">Class</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">School / Institution</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-700 transition"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* 3 Stat Cards in a row (Matching Design Screenshot 5) */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="text-lg font-black text-slate-900 mt-2">{student?.streak || 5} Days</div>
            <span className="text-[11px] text-slate-400 font-bold">Study Streak</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-slate-900 mt-2">{enrolledCount}</div>
            <span className="text-[11px] text-slate-400 font-bold">Active Courses</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-slate-900 mt-2">1</div>
            <span className="text-[11px] text-slate-400 font-bold">Certificate</span>
          </div>
        </section>

        {/* Academic & Progress Section (Matching Design Screenshot 5) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Academic & Progress
          </h3>

          <div className="space-y-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Academic Details</h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Target Board: West Bengal (WBBSE/WBCHSE) • Stream: Commerce & Arts
                  </span>
                </div>
              </div>
              <Check className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Device Security Status</h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Single Active Device Rule Enforced ({student?.activeDeviceName || 'Current Device'})
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Preferences & Support (Matching Design Screenshot 5) */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Preferences & Support
          </h3>

          <div className="space-y-2">
            <a
              href="https://wa.me/916290325241?text=Hello%20Bikash%20Bhaiya%2C%20I%20need%20help%20with%20my%20course"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700">
                    Help & Support
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Contact Bikash Bhaiya Support Team (+91 6290325241)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 font-bold" />
            </a>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Privacy Policy & Guidelines</h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Screen record restricted • Copyright protected educational content
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logout Button (Matching Design Screenshot 5) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black text-sm rounded-2xl border-2 border-red-200 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of Account</span>
          </button>
        </div>

      </main>
    </div>
  );
}
