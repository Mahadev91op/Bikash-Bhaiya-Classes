import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, studentId, couponCode } = body;

    if (!courseId || !studentId) {
      return NextResponse.json({ success: false, error: 'Course ID and Student ID are required.' }, { status: 400 });
    }

    // 1. Get student profile
    const studentDoc = await adminDb.collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({ success: false, error: 'Student record not found in database.' }, { status: 404 });
    }
    const studentData = studentDoc.data() || {};

    // 2. Get course
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ success: false, error: 'Course not found in database.' }, { status: 404 });
    }
    const courseData = courseDoc.data() || {};

    // 3. Check if already enrolled
    const enrollDocRef = adminDb.collection('courses').doc(courseId).collection('enrolledStudents').doc(studentId);
    const existingEnroll = await enrollDocRef.get();
    if (existingEnroll.exists) {
      return NextResponse.json({ success: false, error: 'You are already enrolled in this course.' }, { status: 400 });
    }

    // 4. Calculate price & check coupon if provided
    let originalPrice = Number(courseData.price || 0);
    let finalPrice = originalPrice;
    let appliedCouponData: any = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const couponQuery = await adminDb.collection('courses').doc(courseId).collection('coupons')
        .where('code', '==', cleanCode)
        .limit(1)
        .get();

      if (!couponQuery.empty) {
        const cDoc = couponQuery.docs[0];
        const cData = cDoc.data();

        if (cData.isActive !== false) {
          const now = new Date();
          let expired = false;
          if (cData.expiresAt) {
            const expDate = typeof cData.expiresAt.toDate === 'function' ? cData.expiresAt.toDate() : new Date(cData.expiresAt);
            if (now > expDate) expired = true;
          }

          const usedCount = Number(cData.usedCount || 0);
          const maxUses = Number(cData.maxUses || 0);
          const limitReached = maxUses > 0 && usedCount >= maxUses;

          if (!expired && !limitReached) {
            appliedCouponData = { id: cDoc.id, ...cData };
            if (cData.discountType === 'percentage') {
              const discountAmt = Math.round((originalPrice * Number(cData.discountValue || 0)) / 100);
              finalPrice = Math.max(0, originalPrice - discountAmt);
            } else {
              finalPrice = Math.max(0, originalPrice - Number(cData.discountValue || 0));
            }

            // Increment coupon usage
            await cDoc.ref.update({
              usedCount: admin.firestore.FieldValue.increment(1)
            });
          }
        }
      }
    }

    // 5. Create enrollment
    await enrollDocRef.set({
      studentId: studentId,
      name: studentData.name || 'Student',
      email: studentData.email || '',
      phone: studentData.phone || '',
      courseId: courseId,
      courseTitle: courseData.title || '',
      amountPaid: finalPrice,
      originalPrice: originalPrice,
      couponCode: appliedCouponData ? appliedCouponData.code : null,
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });

    // 6. Increment course enrolledCount
    await adminDb.collection('courses').doc(courseId).update({
      enrolledCount: admin.firestore.FieldValue.increment(1)
    });

    // 7. Update user's enrolledCourses list in user doc for fast lookup
    await adminDb.collection('users').doc(studentId).update({
      enrolledCourses: admin.firestore.FieldValue.arrayUnion(courseId)
    });

    // 8. Add congratulatory notification
    await adminDb.collection('users').doc(studentId).collection('notifications').add({
      title: 'Course Enrolled! 🎉',
      message: `You have successfully enrolled in "${courseData.title}". Start watching lectures now!`,
      type: 'enrollment',
      courseId: courseId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${courseData.title}!`,
      courseId,
      finalPrice
    });

  } catch (error: any) {
    console.error('Enrollment API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Enrollment failed.' }, { status: 500 });
  }
}
