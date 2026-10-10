import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const email = data.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify user exists in Firebase Auth before sending OTP
    try {
      await adminAuth.getUserByEmail(email);
    } catch (e) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    const configDoc = await adminDb.collection('settings').doc('emailConfig').get();
    if (!configDoc.exists) return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
    const config = configDoc.data();
    
    if (!config?.email || !config?.appPassword) return NextResponse.json({ error: 'Server config incomplete' }, { status: 500 });

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await adminDb.collection('otps').doc(email).set({
      otp,
      expiresAt,
      type: 'reset'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.email, pass: config.appPassword }
    });

    await transporter.sendMail({
      from: `Bikash Bhaiya Classes <${config.email}>`,
      to: email,
      subject: 'Password Reset OTP - Bikash Bhaiya Classes',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset</h2>
            <p>Your OTP to reset your password is:</p>
            <h1 style="color: #2563eb; letter-spacing: 2px;">${otp}</h1>
            <p>Valid for 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
