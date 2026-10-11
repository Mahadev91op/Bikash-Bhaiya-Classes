import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const email = data.email?.toLowerCase();
    const phone = data.phone;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (phone) {
      // Check if phone already exists
      const usersRef = adminDb.collection('users');
      const q = await usersRef.where('phone', '==', phone).limit(1).get();
      if (!q.empty) {
        return NextResponse.json({ error: 'This phone number is already registered with another account.' }, { status: 400 });
      }
    }

    // Always fetch fresh config so updates in Admin Settings reflect immediately
    const configDoc = await adminDb.collection('settings').doc('emailConfig').get();
    if (!configDoc.exists) return NextResponse.json({ error: 'Email configuration missing' }, { status: 500 });
    const emailConfig = configDoc.data();
    
    if (!emailConfig?.email || !emailConfig?.appPassword) {
      return NextResponse.json({ error: 'Incomplete email config' }, { status: 500 });
    }
    const systemEmail = emailConfig.email;
    const systemPassword = emailConfig.appPassword;

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    await adminDb.collection('otps').doc(email).set({
      otp,
      expiresAt,
      type: 'signup'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: systemEmail,
        pass: systemPassword
      }
    });

    const mailOptions = {
      from: `Bikash Bhaiya Classes <${systemEmail}>`,
      to: email,
      subject: 'Your Signup OTP - Bikash Bhaiya Classes',
      text: `Your OTP for signup is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome to Bikash Bhaiya Classes!</h2>
            <p>Your OTP for account creation is:</p>
            <h1 style="color: #2563eb; letter-spacing: 2px;">${otp}</h1>
            <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Request OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
