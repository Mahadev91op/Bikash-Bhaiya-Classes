'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const StyledInput = ({ type, placeholder, value, onChange, maxLength }: any) => (
  <input 
    type={type} 
    value={value} 
    onChange={onChange}
    maxLength={maxLength}
    placeholder={placeholder}
    className="w-full px-5 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 transition-all duration-300 placeholder-gray-400 font-medium" 
    required
  />
);

export default function EmailAuth() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'verifySignup' | 'verifyReset' | 'conflict'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [hasReferral, setHasReferral] = useState(false);
  const [referralFriendName, setReferralFriendName] = useState('');
  const [referralFriendPhone, setReferralFriendPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [conflictData, setConflictData] = useState<{ deviceName: string } | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePhone = (p: string) => /^\d{10}$/.test(p);
  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePassword = (p: string) => p.length >= 6;

  const getErrorMessage = (err: any) => {
    const code = err.code || err.message;
    if (code.includes('invalid-credential') || code.includes('user-not-found') || code.includes('wrong-password')) {
      return "Account does not exist or incorrect password. Please sign up first.";
    }
    if (code.includes('email-already-in-use')) {
      return "This email is already registered. Please go to Login.";
    }
    if (code.includes('invalid-email')) {
      return "The email address is invalid.";
    }
    if (code.includes('weak-password')) {
      return "Password is too weak. Use at least 6 characters.";
    }
    if (code.includes('network-request-failed')) {
      return "No internet connection.";
    }
    if (code.includes('too-many-requests')) {
      return "Too many failed attempts. Try again later.";
    }
    if (typeof err === 'string') return err;
    if (err.message && !err.message.includes('Firebase')) return err.message;
    return "Something went wrong. Please try again.";
  };

  const clearErrors = () => { setError(''); setSuccess(''); };

  const registerDevice = async (user: any) => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }
    
    const ua = navigator.userAgent;
    let deviceName = 'Web Browser';
    if (ua.includes('Windows')) deviceName = 'Windows PC';
    else if (ua.includes('Macintosh')) deviceName = 'Mac';
    else if (ua.includes('Android')) deviceName = 'Android Web';
    else if (ua.includes('iPhone') || ua.includes('iPad')) deviceName = 'iOS Web';

    await setDoc(doc(db, 'users', user.uid), { activeDeviceId: deviceId, activeDeviceName: deviceName }, { merge: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (!password) return setError('Password is required.');
    
    clearErrors();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('deviceId', deviceId);
      }

      const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('Your account has been deleted or deactivated by the administrator.');
      }
      
      const data = userDoc.data();
      if (data.activeDeviceId && data.activeDeviceId !== deviceId) {
          setConflictData({ deviceName: data.activeDeviceName || 'Another Device' });
          setMode('conflict');
          setLoading(false);
          return;
      }
      await registerDevice(userCred.user);
      router.push('/classroom');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      if (mode !== 'conflict') setLoading(false);
    }
  };

  const handleResolveConflict = async () => {
    setLoading(true);
    try {
      await registerDevice(auth.currentUser);
      router.push('/classroom');
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleCancelConflict = async () => {
    await auth.signOut();
    setMode('login');
    setConflictData(null);
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your full name.');
    if (!className.trim()) return setError('Please enter your class.');
    if (!validatePhone(phone)) return setError('Please enter a correct 10-digit phone number.');
    if (!schoolName.trim()) return setError('Please enter your school name.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (!validatePassword(password)) return setError('Your password must be at least 6 characters long.');

    clearErrors();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      
      setSuccess('We have sent a 6-digit OTP to your email!');
      setTimeout(() => setSuccess(''), 4000);
      setMode('verifySignup');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('The OTP must be exactly 6 numbers.');

    clearErrors();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, otp, password,
          userData: { 
            name, className, phone, schoolName, 
            referralFriendName: hasReferral ? referralFriendName : '',
            referralFriendPhone: hasReferral ? referralFriendPhone : ''
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect OTP entered.');
      
      if (data.customToken) {
        const userCred = await signInWithCustomToken(auth, data.customToken);
        await registerDevice(userCred.user);
        router.push('/classroom');
      } else {
        throw new Error('Your account was created, but we could not log you in automatically. Please log in manually.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return setError('Please enter a valid email address.');

    clearErrors();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset OTP.');
      
      setSuccess('A reset OTP has been sent to your email!');
      setTimeout(() => setSuccess(''), 4000);
      setMode('verifyReset');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('The OTP must be exactly 6 numbers.');
    if (!validatePassword(password)) return setError('Your new password must be at least 6 characters long.');

    clearErrors();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect OTP or password update failed.');
      
      setSuccess('Your password has been successfully updated! Logging you in...');
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await registerDevice(userCred.user);
      router.push('/classroom');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row selection:bg-blue-200">
      
      {/* LEFT SIDE - BRANDING / VISUALS (Visible on Web Desktop) */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white rounded-full mix-blend-overlay opacity-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-overlay opacity-20 animate-pulse" style={{ animationDuration: '10s' }}></div>
        
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <span className="text-blue-600 font-black text-2xl">B</span>
          </div>
          <span className="text-white text-2xl font-bold tracking-wide">Bikash Bhaiya</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up">
            Your Journey to <br/> Excellence Begins Here.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed font-light mb-8 opacity-90">
            Join the ultimate e-learning platform. Unlock premium courses, live interactive sessions, and expert guidance tailored just for you.
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-[#2563eb]"></div>
              <div className="w-10 h-10 rounded-full bg-blue-300 border-2 border-[#2563eb]"></div>
              <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-[#2563eb]"></div>
            </div>
            <span className="text-white text-sm font-medium">Join 10,000+ Students</span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-200 text-sm">© {new Date().getFullYear()} Bikash Bhaiya Classes. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE - AUTHENTICATION FORM */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white relative">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden absolute top-8 left-6 right-6 text-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Bikash Bhaiya Classes</h1>
        </div>

        <div className="w-full max-w-xl transition-all duration-500 mt-12 md:mt-0">
          
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
              {mode === 'verifySignup' && 'Verify OTP'}
              {mode === 'verifyReset' && 'Set New Password'}
              {mode === 'conflict' && 'Session Active'}
            </h2>
            <p className="text-gray-500 text-base lg:text-lg font-medium">
              {mode === 'login' && 'Please enter your details to sign in.'}
              {mode === 'signup' && 'Enter your details below to register.'}
              {(mode === 'verifySignup' || mode === 'verifyReset') && 'Check your email for the OTP.'}
              {mode === 'conflict' && 'You are already logged in on another device.'}
            </p>
          </div>
          
          {/* Error Message */}
          <div className={`transition-all duration-500 overflow-hidden ${error ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          </div>

          {/* Success Message */}
          <div className={`transition-all duration-500 overflow-hidden ${success ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm font-medium flex items-center">
              <span className="mr-2">✅</span> {success}
            </div>
          </div>

          <div className="animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            
            {mode === 'conflict' && (
              <div className="space-y-6 text-center">
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-2">Login Conflict Detected</h3>
                  <p className="text-orange-700 font-medium">
                    Your account is currently active on <span className="font-bold text-orange-900">{conflictData?.deviceName}</span>. 
                    Logging in here will log you out from that device.
                  </p>
                </div>
                
                <div className="flex flex-col space-y-3 pt-4">
                  <button onClick={handleResolveConflict} disabled={loading} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg lg:text-xl rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70">
                    {loading ? 'Logging in...' : 'Log in here anyway'}
                  </button>
                  <button onClick={handleCancelConflict} disabled={loading} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg lg:text-xl rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <StyledInput type="email" placeholder="Email Address" value={email} onChange={(e:any) => setEmail(e.target.value)} />
                <StyledInput type="password" placeholder="Password" value={password} onChange={(e:any) => setPassword(e.target.value)} />
                
                <div className="flex justify-between items-center py-2 px-1">
                  <label className="flex items-center space-x-3 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="peer w-5 h-5 appearance-none border-2 border-gray-300 rounded-md bg-white checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer shadow-sm" />
                      <svg className={`absolute w-3.5 h-3.5 text-white pointer-events-none transition-transform duration-200 ${rememberMe ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-base text-gray-600 font-medium group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setMode('reset'); clearErrors(); }} className="text-base font-bold text-blue-600 hover:text-blue-800 transition-colors hover:underline decoration-blue-300 underline-offset-4">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading} 
                  className="group relative w-full py-4 mt-4 bg-[#111827] text-white font-bold text-lg lg:text-xl rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:transform-none overflow-hidden">
                  <span className="relative z-10">{loading ? 'Logging in...' : 'Sign In'}</span>
                </button>
                
                <div className="text-center pt-6">
                  <p className="text-gray-500 text-base font-medium">Don't have an account?{' '}
                    <button type="button" onClick={() => { setMode('signup'); clearErrors(); }} className="font-bold text-blue-600 hover:text-blue-800 transition-colors">Sign up</button>
                  </p>
                </div>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignupRequest} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <StyledInput type="text" placeholder="Full Name" value={name} onChange={(e:any) => setName(e.target.value)} />
                  <StyledInput type="text" placeholder="Class (e.g. 10th)" value={className} onChange={(e:any) => setClassName(e.target.value)} />
                </div>
                
                <StyledInput type="tel" placeholder="Phone Number" value={phone} maxLength={10} onChange={(e:any) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} />
                <StyledInput type="text" placeholder="School Name" value={schoolName} onChange={(e:any) => setSchoolName(e.target.value)} />
                <StyledInput type="email" placeholder="Email Address" value={email} onChange={(e:any) => setEmail(e.target.value)} />
                <StyledInput type="password" placeholder="Create Password" value={password} onChange={(e:any) => setPassword(e.target.value)} />
                
                {/* Referral Section */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label onClick={() => setHasReferral(!hasReferral)} className="flex items-center cursor-pointer group mb-1">
                    <div className={`w-5 h-5 flex items-center justify-center rounded bg-white border-2 mr-3 transition-colors ${hasReferral ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                      <svg className={`w-3.5 h-3.5 text-white pointer-events-none transition-transform duration-200 ${hasReferral ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-700">Referred by a friend? (Optional)</span>
                  </label>
                  
                  {hasReferral && (
                    <div className="mt-4 space-y-3 animate-fade-in-up" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                      <StyledInput type="text" placeholder="Friend's Name" value={referralFriendName} onChange={(e:any) => setReferralFriendName(e.target.value)} />
                      <StyledInput type="tel" placeholder="Friend's Phone Number" value={referralFriendPhone} maxLength={10} onChange={(e:any) => setReferralFriendPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg lg:text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70">
                  {loading ? 'Sending OTP...' : 'Register Account'}
                </button>
                <div className="text-center pt-6">
                  <button type="button" onClick={() => {setMode('login'); clearErrors();}} className="text-base font-medium text-gray-500 hover:text-blue-600 transition-colors">Already have an account? Login</button>
                </div>
              </form>
            )}

            {(mode === 'verifySignup' || mode === 'verifyReset') && (
              <form onSubmit={mode === 'verifySignup' ? handleVerifySignup : handleVerifyReset} className="space-y-6">
                <div className="bg-blue-50/70 p-6 rounded-2xl border border-blue-100 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl"></div>
                  <p className="text-base text-blue-800 font-medium">
                    OTP sent securely to <br/><span className="font-bold text-blue-900 text-lg tracking-wide mt-1 inline-block">{email}</span>
                  </p>
                </div>
                
                <div className="pt-2">
                  <label className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-3 block text-center">Enter 6-Digit OTP</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))} 
                    className="w-full px-4 py-6 bg-[#f8fafc] border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-center text-4xl lg:text-5xl tracking-[0.4em] font-mono text-gray-800 transition-all shadow-sm placeholder-gray-300" 
                    placeholder="------" />
                </div>

                {mode === 'verifyReset' && (
                  <div className="pt-4">
                    <StyledInput type="password" placeholder="New Password" value={password} onChange={(e:any) => setPassword(e.target.value)} />
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg lg:text-xl rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70">
                  {loading ? 'Verifying...' : (mode === 'verifySignup' ? 'Verify & Login' : 'Set Password & Login')}
                </button>
                <div className="text-center pt-4">
                  <button type="button" onClick={() => {setMode(mode === 'verifySignup' ? 'signup' : 'reset'); clearErrors();}} className="text-base font-bold text-gray-500 hover:text-blue-600 transition-colors">← Go Back</button>
                </div>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleResetRequest} className="space-y-6">
                <p className="text-lg text-gray-500 font-medium leading-relaxed">Enter your registered email address and we'll send you a secure OTP to reset your password.</p>
                
                <StyledInput type="email" placeholder="Email Address" value={email} onChange={(e:any) => setEmail(e.target.value)} />
                
                <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-[#111827] hover:bg-black text-white font-bold text-lg lg:text-xl rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70">
                  {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
                
                <div className="text-center pt-4">
                  <button type="button" onClick={() => {setMode('login'); clearErrors();}} className="text-base font-bold text-gray-500 hover:text-blue-600 transition-colors">Wait, I remember my password!</button>
                </div>
              </form>
            )}
            
            {(mode === 'login' || mode === 'signup') && (
              <div className="text-center pt-8 border-t border-gray-100 mt-10">
                <p className="text-sm text-gray-400 font-medium">
                  By continuing, you agree to our <br/>
                  <a href="#" className="font-bold text-gray-500 hover:text-blue-600 transition-colors">Terms and Conditions</a> & <a href="#" className="font-bold text-gray-500 hover:text-blue-600 transition-colors">Privacy Statement</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
