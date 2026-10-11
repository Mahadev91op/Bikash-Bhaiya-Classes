import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { action, status, newPassword } = body;
    const uid = params.id;

    if (!uid) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    if (action === 'resetPassword') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      
      await adminAuth.updateUser(uid, { password: newPassword });
      
      // Add notification with new password
      await adminDb.collection('users').doc(uid).collection('notifications').add({
        title: 'Security Alert: Password Reset',
        message: `Your account password has been reset by the administrator. Your new password is: ${newPassword}`,
        type: 'security',
        createdAt: new Date(),
        read: false
      });

      return NextResponse.json({ success: true, newPassword });
    }
    
    if (action === 'updateStatus') {
      const isDisabled = status === 'suspended';
      await adminAuth.updateUser(uid, { disabled: isDisabled });
      await adminDb.collection('users').doc(uid).update({ status: status });
      
      await adminDb.collection('users').doc(uid).collection('notifications').add({
        title: 'Account Status Update',
        message: `Your account has been marked as ${status.toUpperCase()} by the administrator.`,
        type: 'security',
        createdAt: new Date(),
        read: false
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'deleteAccount') {
      // 1. Delete Auth user safely
      try {
        await adminAuth.deleteUser(uid);
      } catch (authErr) {
        console.warn('Auth user deletion warning:', authErr);
      }

      // 2. Clean up student's enrollments across all courses to prevent orphaned records
      try {
        const coursesSnap = await adminDb.collection('courses').get();
        for (const cDoc of coursesSnap.docs) {
          const enrollDocRef = cDoc.ref.collection('enrolledStudents').doc(uid);
          const enrollSnap = await enrollDocRef.get();
          if (enrollSnap.exists) {
            await enrollDocRef.delete();
            const currentCount = cDoc.data()?.enrolledCount || 1;
            await cDoc.ref.update({ enrolledCount: Math.max(0, currentCount - 1) });
          }
        }
      } catch (enrollErr) {
        console.warn('Error cleaning up student enrollments:', enrollErr);
      }

      // 3. Delete user document from users collection
      await adminDb.collection('users').doc(uid).delete();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
