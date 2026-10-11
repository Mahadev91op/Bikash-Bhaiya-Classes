import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const email = data.email?.toLowerCase();
    const otp = data.otp;
    const password = data.password;
    const userData = data.userData; // {name, phone, className, schoolName}

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const otpDoc = await adminDb.collection('otps').doc(email).get();
    
    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'No OTP found for this email' }, { status: 400 });
    }

    const otpData = otpDoc.data();
    if (!otpData || otpData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (Date.now() > (otpData.expiresAt || 0)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // OTP is valid. Create the user in Firebase Auth.
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: userData?.name || 'Student'
    });

    // Save user profile in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      email: email,
      name: userData?.name || '',
      phone: userData?.phone || '',
      className: userData?.className || '',
      schoolName: userData?.schoolName || '',
      referralFriendName: userData?.referralFriendName || '',
      referralFriendPhone: userData?.referralFriendPhone || '',
      role: 'student',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Delete OTP document
    await adminDb.collection('otps').doc(email).delete();

    // Create a custom token so the client can sign in immediately
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({ success: true, customToken });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
