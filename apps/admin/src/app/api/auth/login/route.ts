import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // Fetch password from database
    const configDoc = await adminDb.collection('settings').doc('adminConfig').get();
    if (!configDoc.exists) {
      return NextResponse.json({ error: 'Admin configuration missing in database.' }, { status: 500 });
    }
    
    const dbPassword = configDoc.data()?.password;

    if (password === dbPassword) {
      // Set secure HTTP-only cookie
      cookies().set({
        name: 'admin_secure_session',
        value: 'valid_admin_token',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict'
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
