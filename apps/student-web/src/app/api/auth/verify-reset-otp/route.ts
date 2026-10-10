import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const email = data.email?.toLowerCase();
    const otp = data.otp;
    const newPassword = data.newPassword;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const otpDoc = await adminDb.collection('otps').doc(email).get();
    if (!otpDoc.exists) return NextResponse.json({ error: 'No OTP found' }, { status: 400 });
    
    const otpData = otpDoc.data();
    if (otpData?.otp !== otp || otpData?.type !== 'reset') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (Date.now() > otpData.expiresAt) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    let uid = '';
    try {
      const user = await adminAuth.getUserByEmail(email);
      uid = user.uid;
    } catch (e) {
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
    }

    await adminAuth.updateUser(uid, { password: newPassword });
    await adminDb.collection('otps').doc(email).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
