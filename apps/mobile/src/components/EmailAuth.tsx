import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform, LayoutAnimation, UIManager } from 'react-native';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const InputField = ({ placeholder, value, onChangeText, secure = false, type = 'default', maxLength }: any) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    placeholderTextColor="#9ca3af" // Light gray placeholder
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secure}
    keyboardType={type}
    maxLength={maxLength}
    autoCapitalize={type === 'email-address' ? 'none' : 'sentences'}
  />
);

export default function EmailAuth() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'verifySignup' | 'verifyReset' | 'conflict'>('login');
  const [isInitializing, setIsInitializing] = useState(true);
  
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Beautiful initial loading screen for 1 second
    const timer = setTimeout(() => setIsInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const changeMode = (newMode: typeof mode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(newMode);
    setError('');
  };

  // Validate Email
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const API_BASE = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

  const registerDevice = async (user: any) => {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    
    const deviceName = Platform.OS === 'ios' ? 'iOS Device' : 'Android Device';
    await setDoc(doc(db, 'users', user.uid), { activeDeviceId: deviceId, activeDeviceName: deviceName }, { merge: true });
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (!password) return setError('Password is required.');

    setError('');
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('deviceId', deviceId);
      }

      const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('Your account has been deleted or deactivated by the administrator.');
      }

      const data = userDoc.data();
      if (data.activeDeviceId && data.activeDeviceId !== deviceId) {
          setConflictData({ deviceName: data.activeDeviceName || 'Another Device' });
          changeMode('conflict');
          setLoading(false);
          return;
      }

      await registerDevice(userCred.user);
      router.replace('/(tabs)');
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
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleCancelConflict = async () => {
    await auth.signOut();
    changeMode('login');
    setConflictData(null);
  };

  const handleSignupRequest = async () => {
    if (!name.trim()) return setError('Please enter your full name.');
    if (!className.trim()) return setError('Please enter your class.');
    if (phone.length !== 10) return setError('Please enter a correct 10-digit phone number.');
    if (!schoolName.trim()) return setError('Please enter your school name.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Your password must be at least 6 characters long.');

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      
      changeMode('verifySignup');
      Alert.alert('Success', 'We have sent a 6-digit OTP to your email!');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async () => {
    if (otp.length !== 6) return setError('The OTP must be exactly 6 numbers.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-signup-otp`, {
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
        router.replace('/(tabs)');
      } else {
        throw new Error('Your account was created, but we could not log you in automatically. Please log in manually.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async () => {
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset OTP.');
      changeMode('verifyReset');
      Alert.alert('Success', 'A reset OTP has been sent to your email!');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async () => {
    if (otp.length !== 6) return setError('The OTP must be exactly 6 numbers.');
    if (password.length < 6) return setError('Your new password must be at least 6 characters long.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect OTP or password update failed.');
      
      Alert.alert('Success', 'Your password has been successfully updated! Logging you in...');
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await registerDevice(userCred.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingTitle}>Bikash Bhaiya Classes</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.loginWrapper}>
        <View style={styles.headerLogin}>
          <Text style={styles.titleMain}>Bikash Bhaiya Classes</Text>
          <Text style={styles.titleLogin}>
            {mode === 'login' && 'Login'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
            {mode === 'verifySignup' && 'Verify OTP'}
            {mode === 'verifyReset' && 'Set New Password'}
            {mode === 'conflict' && 'Session Active'}
          </Text>
        </View>
        
        <View style={styles.body}>
          {error ? (
            <View style={[styles.errorContainer, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
              <Ionicons name="alert-circle" size={16} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {mode === 'conflict' && (
            <View style={styles.form}>
              <View style={[styles.infoBox, { backgroundColor: '#fff7ed', borderColor: '#ffedd5', alignItems: 'center' }]}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#fed7aa', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Ionicons name="alert" size={26} color="#ea580c" />
                </View>
                <Text style={[styles.infoText, { color: '#9a3412', fontWeight: 'bold', fontSize: 16 }]}>Login Conflict Detected</Text>
                <Text style={[styles.subtitleDark, { marginTop: 8, color: '#c2410c', textAlign: 'center' }]}>
                  Your account is currently active on <Text style={{ fontWeight: 'bold', color: '#7c2d12' }}>{conflictData?.deviceName}</Text>.
                  Logging in here will log you out from that device.
                </Text>
              </View>
              
              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: '#ea580c', marginTop: 25 }]} onPress={handleResolveConflict} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in here anyway</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: '#f3f4f6', marginTop: 15, elevation: 0, shadowOpacity: 0 }]} onPress={handleCancelConflict} disabled={loading} activeOpacity={0.8}>
                <Text style={[styles.buttonText, { color: '#374151' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'login' && (
            <View style={styles.form}>
              <InputField placeholder="Email Address" value={email} onChangeText={setEmail} type="email-address" />
              <View style={{height: 15}} />
              <InputField placeholder="Password" value={password} onChangeText={setPassword} secure={true} />
              
              <View style={styles.rowBetween}>
                <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeMode('reset')} activeOpacity={0.7}>
                  <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: '#111827' }]} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
              </TouchableOpacity>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => changeMode('signup')} activeOpacity={0.7}>
                  <Text style={styles.linkTextBold}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'signup' && (
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField placeholder="Full Name" value={name} onChangeText={setName} />
                </View>
                <View style={styles.halfWidth}>
                  <InputField placeholder="Class (e.g. 10th)" value={className} onChangeText={setClassName} />
                </View>
              </View>
              
              <View style={{height: 15}} />
              <InputField placeholder="Phone Number" value={phone} maxLength={10} onChangeText={(t: string) => setPhone(t.replace(/[^0-9]/g, '').slice(0,10))} type="phone-pad" />
              <View style={{height: 15}} />
              <InputField placeholder="School Name" value={schoolName} onChangeText={setSchoolName} />
              <View style={{height: 15}} />
              <InputField placeholder="Email Address" value={email} onChangeText={setEmail} type="email-address" />
              <View style={{height: 15}} />
              <InputField placeholder="Create Password" value={password} onChangeText={setPassword} secure={true} />
              
              {/* Referral Section */}
              <View style={styles.referralContainer}>
                <TouchableOpacity 
                  style={styles.referralHeader} 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setHasReferral(!hasReferral);
                  }} 
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, hasReferral && styles.checkboxActive, { marginRight: 12 }]}>
                    {hasReferral && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.referralTitle}>Referred by a friend? (Optional)</Text>
                </TouchableOpacity>
                
                {hasReferral && (
                  <View style={styles.referralFields}>
                    <InputField placeholder="Friend's Name" value={referralFriendName} onChangeText={setReferralFriendName} />
                    <View style={{height: 12}} />
                    <InputField placeholder="Friend's Phone Number" value={referralFriendPhone} maxLength={10} onChangeText={(t: string) => setReferralFriendPhone(t.replace(/[^0-9]/g, '').slice(0,10))} type="phone-pad" />
                  </View>
                )}
              </View>              
              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: '#2563eb', marginTop: 25 }]} onPress={handleSignupRequest} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register Account</Text>}
              </TouchableOpacity>
              
              <View style={styles.footer}>
                <TouchableOpacity onPress={() => changeMode('login')} activeOpacity={0.7}>
                  <Text style={styles.linkText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(mode === 'verifySignup' || mode === 'verifyReset') && (
            <View style={styles.form}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>OTP sent securely to</Text>
                <Text style={styles.infoEmail}>{email}</Text>
              </View>

              <Text style={[styles.label, { textAlign: 'center', marginTop: 15 }]}>Enter 6-Digit OTP</Text>
              <TextInput 
                style={styles.otpInput} 
                placeholder="------" 
                placeholderTextColor="#d1d5db"
                value={otp} 
                onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0,6))} 
                keyboardType="number-pad" 
                maxLength={6}
              />
              
              {mode === 'verifyReset' && (
                <View style={{ marginTop: 15 }}>
                  <InputField placeholder="New Password" value={password} onChangeText={setPassword} secure={true} />
                </View>
              )}

              <TouchableOpacity style={styles.buttonPrimary} onPress={mode === 'verifySignup' ? handleVerifySignup : handleVerifyReset} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{mode === 'verifySignup' ? 'Verify & Login' : 'Set Password & Login'}</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => changeMode(mode === 'verifySignup' ? 'signup' : 'reset')} style={styles.footer} activeOpacity={0.7}>
                <Text style={styles.linkText}>← Go Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'reset' && (
            <View style={styles.form}>
              <Text style={styles.subtitleDark}>Enter your registered email address to receive a secure password reset OTP.</Text>
              
              <View style={{marginTop: 20}}>
                <InputField placeholder="Email Address" value={email} onChangeText={setEmail} type="email-address" />
              </View>
              
              <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: '#111827', marginTop: 25 }]} onPress={handleResetRequest} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset OTP</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => changeMode('login')} style={styles.footer} activeOpacity={0.7}>
                <Text style={styles.linkText}>Wait, I remember my password!</Text>
              </TouchableOpacity>
            </View>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <Text style={styles.termsText}>
              By continuing, you agree with our{'\n'}
              <Text style={{color: '#2563eb', fontWeight: 'bold'}}>Terms and Conditions</Text> & <Text style={{color: '#2563eb', fontWeight: 'bold'}}>Privacy Statement</Text>
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginWrapper: {
    width: '90%',
    maxWidth: 450,
    paddingHorizontal: 25,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  headerLogin: {
    alignItems: 'center',
    marginBottom: 35,
  },
  titleMain: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 5,
  },
  titleLogin: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  body: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    marginBottom: 20,
    borderRadius: 6,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#dbeafe',
    borderWidth: 1,
  },
  infoText: {
    color: '#1e40af',
    fontSize: 13,
  },
  infoEmail: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  subtitleDark: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  otpInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 18,
    fontSize: 32,
    letterSpacing: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  referralContainer: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralTitle: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  referralFields: {
    marginTop: 15,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
  linkTextBold: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '800',
  },
  termsText: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 35,
    lineHeight: 18,
  }
});
