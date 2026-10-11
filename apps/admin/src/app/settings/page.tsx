'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

interface SettingsConfig {
  email: {
    email: string;
    adminEmail: string;
    hasAppPassword: boolean;
    appPasswordMasked: string;
    rawAppPassword: string;
    updatedAt: string | null;
  };
  admin: {
    hasPassword: boolean;
    updatedAt: string | null;
  };
  payment: {
    keyId: string;
    hasSecret: boolean;
    keySecretMasked: string;
    rawSecret: string;
    isEnabled: boolean;
    updatedAt: string | null;
  };
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    updatedAt: string | null;
  };
}

interface Infrastructure {
  database: {
    provider: string;
    projectId: string;
    status: string;
    collections: {
      users: number;
      courses: number;
      settings: number;
    };
  };
  storage: {
    provider: string;
    bucketName: string;
    totalFiles: number;
    totalBytes: number;
    formattedSize: string;
    status: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SettingsConfig | null>(null);
  const [infra, setInfra] = useState<Infrastructure | null>(null);

  // Form states - Email
  const [senderEmail, setSenderEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Test Email
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form states - Admin Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Form states - Payment
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Maintenance state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // Feedback notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setInfra(data.infrastructure);

        // Populate form initial fields
        setSenderEmail(data.config.email.email || '');
        setAppPassword(data.config.email.rawAppPassword || '');
        setAdminEmail(data.config.email.adminEmail || '');

        setRazorpayKeyId(data.config.payment.keyId || '');
        setRazorpayKeySecret(data.config.payment.rawSecret || '');
        setRazorpayEnabled(data.config.payment.isEnabled ?? false);

        setMaintenanceMode(data.config.system.maintenanceMode ?? false);
        setMaintenanceMessage(data.config.system.maintenanceMessage || '');
      } else {
        showToast('error', data.error || 'Failed to load configuration.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error loading settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 1. Save Email Config
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-email',
          email: senderEmail,
          appPassword: appPassword,
          adminEmail: adminEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || 'Email settings saved successfully.');
        fetchSettings();
      } else {
        showToast('error', data.error || 'Failed to update email settings.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error updating email.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  // 2. Send Test Email
  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-email',
          email: senderEmail,
          appPassword: appPassword,
          targetEmail: testEmailTarget || senderEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailResult({ success: true, message: data.message });
      } else {
        setTestEmailResult({ success: false, message: data.error || 'Failed to send test email.' });
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, message: err.message || 'Error executing email test.' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // 3. Save Admin Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters long.');
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-password',
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Admin master password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('error', data.error || 'Failed to update admin password.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error updating password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 4. Save Payment Config
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-payment',
          keyId: razorpayKeyId,
          keySecret: razorpayKeySecret,
          isEnabled: razorpayEnabled
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Razorpay settings saved successfully.');
        fetchSettings();
      } else {
        showToast('error', data.error || 'Failed to update Razorpay settings.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error updating payments.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // 5. Toggle Maintenance Mode
  const handleToggleMaintenance = async (newMode: boolean) => {
    setIsSavingMaintenance(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-maintenance',
          maintenanceMode: newMode,
          maintenanceMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setMaintenanceMode(newMode);
        showToast('success', data.message);
        fetchSettings();
      } else {
        showToast('error', data.error || 'Failed to toggle maintenance mode.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error updating maintenance mode.');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center space-x-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-600/95 border-emerald-400'
                : 'bg-rose-600/95 border-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse mr-1.5"></span>
              Live Database Sync
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage email delivery credentials, admin security password, Razorpay payment gateway, and student maintenance access in real time.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="inline-flex items-center self-start md:self-auto space-x-2 px-4 py-2.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 hover:text-slate-950 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. EMERGENCY MAINTENANCE MODE BANNER */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 p-6 sm:p-8 transition-all shadow-md ${
          maintenanceMode
            ? 'bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border-amber-400 shadow-amber-500/10'
            : 'bg-white border-slate-300 shadow-slate-200/50'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className={`p-3 rounded-xl shadow-md ${maintenanceMode ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span>Student App & Website Maintenance Mode</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      maintenanceMode
                        ? 'bg-rose-500 text-white shadow-sm animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {maintenanceMode ? 'Maintenance Active (OFFLINE)' : 'System Live (NORMAL)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Admin panel access remains unrestricted. When toggled ON, students on Web & Mobile apps will see the maintenance notice screen.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Notice Message Shown to Students:
              </label>
              <input
                type="text"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="e.g. The platform is currently undergoing scheduled maintenance. Please check back shortly."
                className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 shadow-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {maintenanceMode ? (
              <button
                onClick={() => handleToggleMaintenance(false)}
                disabled={isSavingMaintenance}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{isSavingMaintenance ? 'Updating...' : 'Turn OFF Maintenance (Go Live)'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleMaintenance(true)}
                disabled={isSavingMaintenance}
                className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span>{isSavingMaintenance ? 'Updating...' : 'Turn ON Maintenance Mode'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. INFRASTRUCTURE & STORAGE OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Connected Database */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connected Database</span>
            <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
              Live
            </span>
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900 truncate" title={infra?.database.projectId || 'bikash-bhaiya-classes'}>
              {infra?.database.projectId || 'bikash-bhaiya-classes'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono font-medium">
              Provider: {infra?.database.provider || 'Google Cloud Firestore'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Collections:</span>
            <span className="font-bold text-slate-800">courses, users, settings</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {infra?.database.collections.users ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Active student accounts
            </div>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Published Courses:</span>
            <span className="font-bold text-blue-700">{infra?.database.collections.courses ?? 0} courses</span>
          </div>
        </div>

        {/* Cloud Storage Usage */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cloud Storage Used</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z" />
              </svg>
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-indigo-950">
              {infra?.storage.formattedSize || '0.00 KB'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono truncate" title={infra?.storage.bucketName}>
              {infra?.storage.bucketName || 'bikash-bhaiya-classes.firebasestorage.app'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Uploaded Files:</span>
            <span className="font-bold text-slate-800">{infra?.storage.totalFiles ?? 0} files</span>
          </div>
        </div>

        {/* Email Engine Status */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nodemailer Engine</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                config?.email.hasAppPassword
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {config?.email.hasAppPassword ? 'Configured' : 'Needs Password'}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 truncate" title={config?.email.email || 'None'}>
              {config?.email.email || 'No email configured'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Google SMTP / App Password
            </div>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Admin Alert Email:</span>
            <span className="font-bold text-slate-800 truncate max-w-[120px]" title={config?.email.adminEmail}>
              {config?.email.adminEmail || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN FORMS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* A. NODEMAILER / EMAIL SETTINGS */}
        <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-slate-100">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">Nodemailer Configuration</h2>
                <p className="text-xs text-slate-500 font-medium">Manage Google SMTP email and 16-character App Password for OTP delivery.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Sender Gmail Address
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. yourclasses@gmail.com"
                  className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Google App Password (16 characters)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAppPassword(!showAppPassword)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    {showAppPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAppPassword ? 'text' : 'password'}
                    required
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    placeholder="e.g. abcd efgh ijkl mnop"
                    className="w-full text-sm font-mono font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 shadow-sm outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Generate from: <strong>Google Account → Security → 2-Step Verification → App Passwords</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@bikashclasses.com"
                  className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingEmail ? 'Saving...' : 'Save Email Credentials'}
                </button>
              </div>
            </form>
          </div>

          {/* Test Email Section */}
          <div className="mt-8 pt-5 border-t-2 border-slate-100 bg-slate-50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-2xl border-b-2 border-x-2 border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <span>🚀 Verify & Test Email Delivery</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testEmailTarget}
                onChange={(e) => setTestEmailTarget(e.target.value)}
                placeholder={`Recipient email (Defaults to: ${senderEmail || 'Sender'})`}
                className="flex-1 text-xs font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-600 shadow-sm"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail || !senderEmail || !appPassword}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 shrink-0"
              >
                {isSendingTestEmail ? 'Sending...' : 'Send Test Mail'}
              </button>
            </div>

            {testEmailResult && (
              <div
                className={`mt-3 p-3.5 rounded-xl text-xs font-semibold border-2 ${
                  testEmailResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {testEmailResult.success ? '✅ ' : '❌ '}
                {testEmailResult.message}
              </div>
            )}
          </div>
        </div>

        {/* B. ADMIN MASTER PASSWORD SETTINGS */}
        <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-slate-100">
              <span className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">Admin Master Password</h2>
                <p className="text-xs text-slate-500 font-medium">Update the master security password required to unlock this Admin Portal.</p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Master Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900"
                  >
                    {showCurrentPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current master password"
                  className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    New Master Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900"
                  >
                    {showNewPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min 6 characters)"
                  className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password to confirm"
                  className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword || !currentPassword || !newPassword}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingPassword ? 'Updating...' : 'Update Master Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-slate-100 flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Password is encrypted and safely connected to database document <code className="text-slate-800 font-mono font-bold">settings/adminConfig</code>.</span>
          </div>
        </div>

        {/* C. RAZORPAY PAYMENT GATEWAY SETTINGS */}
        <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between lg:col-span-2 hover:border-slate-300 transition-all">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Razorpay Payment Gateway</h2>
                  <p className="text-xs text-slate-500 font-medium">Configure online student course fees and checkout with Razorpay API credentials.</p>
                </div>
              </div>

              {/* Robust, High-Contrast Interactive Toggle Button */}
              <div className="flex items-center space-x-3 bg-slate-50 border-2 border-slate-200 px-4 py-2 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRazorpayEnabled(!razorpayEnabled)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    razorpayEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Online Payments"
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      razorpayEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${razorpayEnabled ? 'text-indigo-800' : 'text-slate-600'}`}>
                    {razorpayEnabled ? 'Active & Accepting Payments' : 'Payments Disabled'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {razorpayEnabled ? 'Students can checkout online' : 'Admissions set to manual only'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Razorpay Key ID
                  </label>
                  {razorpayKeyId.startsWith('rzp_test_') && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                      TEST ENVIRONMENT
                    </span>
                  )}
                  {razorpayKeyId.startsWith('rzp_live_') && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      LIVE PRODUCTION
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="rzp_test_... or rzp_live_..."
                  className="w-full text-sm font-mono font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Razorpay Key Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {showKeySecret ? 'Hide Secret' : 'Show Secret'}
                  </button>
                </div>
                <input
                  type={showKeySecret ? 'text' : 'password'}
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder="Enter Razorpay Secret Key"
                  className="w-full text-sm font-mono font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl px-4 py-3 placeholder:text-slate-400 placeholder:font-normal focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 shadow-sm outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500 font-medium">
                  Stored directly in database <code className="text-slate-800 font-mono font-bold">settings/paymentConfig</code> without duplicate collections.
                </p>
                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingPayment ? 'Saving...' : 'Save Razorpay Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
